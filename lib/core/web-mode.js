// 同一套后端代码同时服务两种 Web 入口，登录/管理权限策略不同：
//
//   classic（默认）—— 原版 Next 页面：沿用上游语义，未开启整站登录时，
//                     配置、密钥、技能等管理接口不需要管理员令牌（本地自用/内网）。
//   studio         —— Studio 页面：管理接口始终要求管理员账号登录，
//                     即使整站免登录也一样，避免后台与密钥跟着裸奔。
//
// 用 IC_WEB_MODE 区分，避免 Studio 的严格校验反向影响原版 Web。
// 启动脚本/Docker 会显式设置；未设置时按 classic 处理（向后兼容原版行为）。
export function webMode() {
  return process.env.IC_WEB_MODE === 'studio' ? 'studio' : 'classic';
}

export function isStudioMode() {
  return webMode() === 'studio';
}

// 原版 Web + 整站免登录：管理接口按上游原样开放。
export function classicOpenAdmin(authEnabled) {
  return !isStudioMode() && !authEnabled;
}
