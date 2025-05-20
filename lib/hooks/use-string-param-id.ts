import { useParams } from "next/navigation";

export const useStringParamId = (): string => {
  const params = useParams();
  const idParam = params?.id;
  if (typeof idParam === "string") return idParam;
  if (Array.isArray(idParam)) return idParam[0] || "";
  return "";
};