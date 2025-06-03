"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Settings,
  Users
} from "lucide-react";
import type {
  Whiteboard,
  Play as PlayType,
  Phase,
  CourtType,
  DifficultyLevel
} from "@/lib/types";
import { WhiteboardCanvas } from "./whiteboard-canvas";
import { useWhiteboardStore } from "./whiteboard-store";

interface WhiteboardContainerProps {
  whiteboard: Whiteboard;
  onSave?: (whiteboard: Whiteboard) => void;
}

export function WhiteboardContainer({
  whiteboard,
  onSave
}: WhiteboardContainerProps) {
  const {
    currentPlay,
    currentPhase,
    currentPhaseIndex,
    isAnimating,
    selectedPlayerId,
    animationSpeed,
    animationProgress,
    setCurrentPlay,
    setCurrentPhaseIndex,
    toggleAnimation,
    setSelectedPlayer,
    updatePlayerPosition,
    setAnimationSpeed,
  } = useWhiteboardStore();

  const [showControls, setShowControls] = useState(true);

  const handlePlaySelect = useCallback((play: PlayType) => {
    setCurrentPlay(play);
  }, [setCurrentPlay]);

  const handlePhaseChange = useCallback((direction: 'prev' | 'next') => {
    if (!currentPlay || !currentPlay.phases) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentPhaseIndex < currentPlay.phases.length - 1 ? currentPhaseIndex + 1 : 0;
    } else {
      newIndex = currentPhaseIndex > 0 ? currentPhaseIndex - 1 : currentPlay.phases.length - 1;
    }

    setCurrentPhaseIndex(newIndex);
  }, [currentPlay, currentPhaseIndex, setCurrentPhaseIndex]);

  // Initialize with first play if none selected
  useEffect(() => {
    if (!currentPlay && whiteboard.plays && whiteboard.plays.length > 0) {
      setCurrentPlay(whiteboard.plays[0]);
    }
  }, [currentPlay, whiteboard.plays, setCurrentPlay]);

  const totalPhases = currentPlay?.phases?.length ?? 0;

  return (
    <div className="flex h-full">
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <WhiteboardCanvas
          courtType={whiteboard.courtType}
          plays={whiteboard.plays || []}
          currentPhase={currentPhase || undefined}
          isAnimating={isAnimating}
          selectedPlayerId={selectedPlayerId || undefined}
          onPlayerSelect={setSelectedPlayer}
          onPlayerMove={updatePlayerPosition}
        />

        {/* Overlay Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Whiteboard Info */}
          <Card className="bg-black/80 backdrop-blur-sm text-white border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{whiteboard.title}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">{whiteboard.sport}</Badge>
                <Badge variant="outline">{whiteboard.difficulty}</Badge>
              </div>
            </CardHeader>
            {whiteboard.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-gray-300">{whiteboard.description}</p>
              </CardContent>
            )}
          </Card>

          {/* View Controls */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Animation Controls */}
        {currentPlay && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Card className="bg-black/80 backdrop-blur-sm text-white border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Phase Navigation */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePhaseChange('prev')}
                    disabled={totalPhases <= 1}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAnimation}
                  >
                    {isAnimating ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePhaseChange('next')}
                    disabled={totalPhases <= 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  {/* Phase Indicator */}
                  <div className="text-sm">
                    Phase {currentPhaseIndex + 1} of {totalPhases}
                  </div>

                  {/* Animation Progress */}
                  {isAnimating && (
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <span className="text-xs">Progress</span>
                      <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 transition-all duration-100"
                          style={{ width: `${(animationProgress || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Speed Control */}
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <span className="text-xs">Speed</span>
                    <Slider
                      value={[animationSpeed]}
                      onValueChange={(value: number[]) => setAnimationSpeed(value[0])}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Current Phase Info */}
                {currentPhase && (
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="text-sm font-medium">{currentPhase.title}</div>
                    {currentPhase.description && (
                      <div className="text-xs text-gray-300 mt-1">
                        {currentPhase.description}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {showControls && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Plays List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plays</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Play
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {whiteboard.plays?.map((play) => (
                  <div
                    key={play.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      currentPlay?.id === play.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePlaySelect(play)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{play.title}</div>
                        {play.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {play.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {play.playerCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline" className="text-xs">
                        {play.phases?.length || 0} phases
                      </Badge>
                      {play.duration && (
                        <span className="text-xs text-gray-500">
                          {play.duration}s
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {(!whiteboard.plays || whiteboard.plays.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No plays created yet</p>
                    <p className="text-xs">Click "Add Play" to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Play Details */}
            {currentPlay && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Current Play: {currentPlay.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Phases */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      Phases
                    </div>
                    <div className="space-y-1">
                      {currentPlay.phases?.map((phase: Phase, index: number) => (
                        <div
                          key={phase.id}
                          className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                            currentPhase?.id === phase.id
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => setCurrentPhaseIndex(index)}
                        >
                          <div className="font-medium">
                            {index + 1}. {phase.title || `Phase ${index + 1}`}
                          </div>
                          {phase.description && (
                            <div className="text-gray-600 mt-1">
                              {phase.description}
                            </div>
                          )}
                          <div className="text-gray-500 mt-1">
                            Duration: {phase.duration}s
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Player Information */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      Players ({currentPlay.playerCount})
                    </div>
                    <div className="space-y-1">
                      {currentPlay.startingPositions?.map((position: any) => (
                        <div
                          key={position.playerId}
                          className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                            selectedPlayerId === position.playerId
                              ? 'bg-yellow-100 border border-yellow-300'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => setSelectedPlayer(position.playerId)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {position.playerName || position.playerId}
                              </div>
                              {position.playerRole && (
                                <div className="text-gray-600">
                                  {position.playerRole}
                                </div>
                              )}
                            </div>
                            {position.jersey && (
                              <Badge variant="outline" className="text-xs">
                                #{position.jersey}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}