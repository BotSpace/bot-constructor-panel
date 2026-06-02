import axios from "axios";
import { SubFlowListResponse, SubFlowPlugin, PluginCategoryListResponse } from "@/types/http/plugin";

const PLUGIN_API_URL =
  process.env.NEXT_PUBLIC_PLUGIN_API || "https://api.botspace.uz/api/engine-plugin";

const pluginInstance = axios.create({
  baseURL: PLUGIN_API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function getSubFlows(params?: {
  category?: string;
  active?: string;
  page?: number;
  per_page?: number;
}): Promise<SubFlowListResponse> {
  const { data } = await pluginInstance.get("/subflows", { params });
  return data;
}

export async function getSubFlow(id: string): Promise<SubFlowPlugin> {
  const { data } = await pluginInstance.get(`/subflows/${id}`);
  return data;
}

export async function getSubFlowBySlug(slug: string): Promise<SubFlowPlugin> {
  const { data } = await pluginInstance.get(`/subflows/slug/${slug}`);
  return data;
}

export async function getSubFlowSchema(
  slug: string
): Promise<Record<string, unknown>> {
  const { data } = await pluginInstance.get(`/subflows/slug/${slug}/schema`);
  return data;
}

export async function getActiveSubFlows(): Promise<SubFlowListResponse> {
  return getSubFlows({ active: "true", per_page: 100 });
}

export async function getPluginCategories(): Promise<PluginCategoryListResponse> {
  const { data } = await pluginInstance.get("/categories", { params: { active: "true" } });
  return data;
}
