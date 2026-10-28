import { NextResponse } from 'next/server';
import { authEnabled, authenticateRequest, authenticateStrict, countUsers } from '@/lib/core/auth.js';
import { loadConfig, classicOpenAdmin } from '@/lib/core/index.js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const enabled = authEnabled();
  const user = authenticateRequest(req, url) || null;
  // 管理后台权限独立于「浏览模式」：Studio 下即使免登录也必须有管理员令牌。
  // 原版 Web（classic）未开启自己的 IC_AUTH 时沿用上游语义，不需要令牌。
  const strictAdmin = authenticateStrict(req, url);
  const adminAllowed = strictAdmin?.role === 'admin' || classicOpenAdmin(enabled);
  let cfg = {};
  try {
    cfg = loadConfig() || {};
  } catch {
    /* 配置读取失败时按“全部显示/不限制来源”处理 */
  }
  return NextResponse.json({
    authEnabled: enabled,
    hasUsers: countUsers() > 0,
    features: cfg.features || {},
    ssoOrigins: Array.isArray(cfg.auth?.sso?.allowedOrigins) ? cfg.auth.sso.allowedOrigins : [],
    adminAllowed,
    user,
  });
}
