import { CommuneData, UserData } from "../types";
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

export async function googleLogin(credential: string) {
  try {
    const res = await axios
      .post(`/api/auth/google`, { token: credential })
      .then((res: AxiosResponse) => res.data);
    return res;
  } catch (error) {
    throw error;
  }
}

// Admin CRUD pour les communes
export async function getAllCommunes(): Promise<CommuneData[]> {
  const res = await axios
    .get<CommuneData[]>(`/api/admin/communes`)
    .then((res: AxiosResponse<CommuneData[]>) => res.data);
  return res;
}

export async function createCommune(data: Partial<CommuneData>) {
  const res = await axios
    .post(`/api/admin/communes`, data)
    .then((res: AxiosResponse) => res.data);
  return res;
}

export async function updateCommune(id: number, data: Partial<CommuneData>) {
  const res = await axios
    .put(`/api/admin/communes/${id}`, data)
    .then((res: AxiosResponse) => res.data);
  return res;
}

export async function deleteCommune(id: number) {
  const res = await axios
    .delete(`/api/admin/communes/${id}`)
    .then((res: AxiosResponse) => res.data);
  return res;
}

// Admin CRUD pour les utilisateurs
export async function getAllUsers(): Promise<UserData[]> {
  const res = await axios
    .get<UserData[]>(`/api/admin/users`)
    .then((res: AxiosResponse<UserData[]>) => res.data);
  return res;
}

export async function createUser(data: Partial<UserData>) {
  const res = await axios
    .post(`/api/admin/users`, data)
    .then((res: AxiosResponse) => res.data);
  return res;
}

export async function updateUser(id: number, data: Partial<UserData>) {
  const res = await axios
    .put(`/api/admin/users/${id}`, data)
    .then((res: AxiosResponse) => res.data);
  return res;
}

export async function deleteUser(id: number) {
  const res = await axios
    .delete(`/api/admin/users/${id}`)
    .then((res: AxiosResponse) => res.data);
  return res;
}
