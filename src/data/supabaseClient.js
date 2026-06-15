// Supabase 클라이언트. 환경변수가 없으면 null을 반환하여
// 앱이 로컬(브라우저) 저장소로 동작하도록 한다.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env?.VITE_SUPABASE_URL;
const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const isCloudConfigured = Boolean(url && key);

export const supabase = isCloudConfigured ? createClient(url, key) : null;
