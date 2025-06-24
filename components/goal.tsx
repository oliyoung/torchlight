// If you have a Goal type/interface, import or define it above:
import { useCoachProfile } from '@/lib/hooks/use-coach-profile';
import type { Goal as GoalType } from '@/lib/types';

const Goal = ({ goal }: { goal: GoalType }) => {
    const { athleteUsage } = useCoachProfile()
    return <div
        key={goal.id}
        className="border border-slate-200 rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors max-w-[1/4]"
    >
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                {goal.description && (
                    <p className="text-foreground text-xl">
                        {goal.description}
                    </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {athleteUsage?.limit != 1 && <span>
                        {goal.athlete.firstName} {goal.athlete.lastName}
                    </span>}
                    {goal.dueDate && (
                        <span>
                            Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span
                    className={`px-2 py-1 text-xs rounded-full ${goal.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : goal.status === "PAUSED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                >
                    {goal.status}
                </span>
            </div>
        </div>
    </div >
}

export default Goal;