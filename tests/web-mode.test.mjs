import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// 原版 Web（classic）与 Studio 必须是两套独立策略：
// classic 只看自己的 IC_AUTH，studio 才读后台写入的 config.auth.enabled。
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ic-web-mode-'));
const cfgPath = path.join(dir, 'config.json');
fs.writeFileSync(cfgPath, JSON.stringify({ auth: { enabled: true } }));
process.env.IC_CONFIG = cfgPath;
delete process.env.IC_AUTH;
delete process.env.IC_WEB_MODE;

const { webMode, classicOpenAdmin } = await import('../lib/core/web-mode.js');
const { authEnabled, resetAuthModeCache } = await import('../lib/core/auth.js');

test('未设置 IC_WEB_MODE 时按原版 Web（classic）处理', () => {
  delete process.env.IC_WEB_MODE;
  assert.equal(webMode(), 'classic');
});

test('IC_WEB_MODE=studio 时进入 Studio 策略', () => {
  process.env.IC_WEB_MODE = 'studio';
  assert.equal(webMode(), 'studio');
  assert.equal(classicOpenAdmin(false), false);
  assert.equal(classicOpenAdmin(true), false);
});

test('classic 未开启登录时管理接口按原版语义开放', () => {
  process.env.IC_WEB_MODE = 'classic';
  assert.equal(classicOpenAdmin(false), true);
  assert.equal(classicOpenAdmin(true), false);
});

test('classic 忽略 Studio 写入的 config.auth.enabled', () => {
  process.env.IC_WEB_MODE = 'classic';
  delete process.env.IC_AUTH;
  resetAuthModeCache();
  assert.equal(authEnabled(), false, '配置文件开启登录也不能影响原版 Web');
});

test('classic 只认自己的 IC_AUTH', () => {
  process.env.IC_WEB_MODE = 'classic';
  process.env.IC_AUTH = '1';
  resetAuthModeCache();
  assert.equal(authEnabled(), true);
  process.env.IC_AUTH = '0';
  resetAuthModeCache();
  assert.equal(authEnabled(), false);
});

test('studio 仍读取 config.auth.enabled', () => {
  process.env.IC_WEB_MODE = 'studio';
  delete process.env.IC_AUTH;
  resetAuthModeCache();
  assert.equal(authEnabled(), true);
});
