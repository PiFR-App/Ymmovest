import { CommuneData } from "../types";
import axios, { AxiosResponse } from "axios";

export async function searchCommunes(query: string): Promise<CommuneData[]> {
  const params = new URLSearchParams({ q: query });
  const res = await axios
    .get<CommuneData[]>(`/api/communes?${params.toString()}`)
    .then((res: AxiosResponse<CommuneData[]>) => res.data);
  return res;
}

export async function getCommuneByCode(
  code: string
): Promise<CommuneData | null> {
  const res = await axios
    .get<CommuneData>(`/api/communes/${encodeURIComponent(code)}`)
    .then((res: AxiosResponse<CommuneData>) => res.data);
  return res;
}

export async function getTransactionStats(
  code: string,
  typeBien: "appartement" | "maison" = "appartement"
) {
  const res = await axios
    .get(`/api/communes/${encodeURIComponent(code)}/stats?type=${typeBien}`)
    .then((res: AxiosResponse) => res.data);
  return res;
}

export async function estimerLoyer(code: string, surface: number) {
  const res = await axios
    .get(`/api/communes/${encodeURIComponent(code)}/loyer?surface=${surface}`)
    .then((res: AxiosResponse) => res.data);
  return res;
}

export async function login(email: string, password: string) {
  const res = await axios
    .post(`/api/auth/login`, { email, password })
    .then((res: AxiosResponse) => res.data);
  return res;
}
