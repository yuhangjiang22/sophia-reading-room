# 私人候选兴趣同步部署

网页托管在 GitHub Pages，内容更新在本机运行。兴趣偏好不能保存在公开仓库，也不能依靠 Sophia 当前设备的 localStorage 让本机定时任务读取。本方案使用单独的 Cloudflare Worker + KV：网页通过登录会话写入候选 ID 和选择，本地半月任务通过另一把工作流密钥读取。Worker 不收集姓名、病历或其他个人资料。

## 目前状态

仓库已包含 Worker、网页接入代码、私有本地队列写入器和自动化读取说明。Cloudflare Worker 尚未部署，因此 `sync-config.js` 的 `apiBase` 保持空值；此时网页保留原有浏览器本地行为，不会声称云端同步成功。要启用跨设备同步，需要一次性 Cloudflare 配置。

## Cloudflare 部署

1. 在本机登录 Cloudflare 并安装/运行 Wrangler：

   ```sh
   npx wrangler login
   npx wrangler kv namespace create SOPHIA_INTERESTS
   ```

2. 把命令输出的 KV namespace ID 填入 `worker/wrangler.toml`，替换 `REPLACE_WITH_CREATED_KV_NAMESPACE_ID`。将 `ALLOWED_ORIGINS` 保持为当前 Pages origin；将来绑定自有域名时，把新 origin 加进去。

3. 在 Worker 环境中设置**秘密**，不要写入 TOML、网页或仓库：

   ```sh
   npx wrangler secret put SOPHIA_TOKEN_SHA256
   npx wrangler secret put WORKFLOW_SYNC_SECRET
   ```

   `SOPHIA_TOKEN_SHA256` 是访问 token 的 SHA-256 十六进制摘要，不是 token 本身。当前静态原型的摘要曾随 `auth.js` 发布；正式启用云端登录前，建议换成新的高熵 token，并把它的 SHA-256 摘要作为 Worker secret。可用本地隐藏输入提示计算摘要：

   ```sh
   python3 -c 'import getpass,hashlib; print(hashlib.sha256(getpass.getpass("New private access token: ").encode()).hexdigest())'
   ```

   再把输出作为 `SOPHIA_TOKEN_SHA256` 的 Worker secret。不要把新 token 发到 GitHub 或写进源码。Sophia 需要通过你们已有的私人渠道收到新 token。

   为 `WORKFLOW_SYNC_SECRET` 生成独立随机密钥（至少 32 字节随机量）。设置 Worker secret 时输入密钥，不要写到项目文件。Worker 部署后，在这台运行半月任务的 Mac 上用 Keychain 保存**同一把**密钥：

   ```sh
   security add-generic-password -U -a "$USER" -s sophia-reading-room-workflow -w
   ```

   按提示输入密钥。不要把它放进 shell 命令历史、项目 `.env`、Issue 或聊天记录。脚本只从 macOS Keychain 读取；测试时也可临时设置 `SOPHIA_WORKFLOW_SYNC_KEY` 环境变量。

4. 部署 Worker：

   ```sh
   npx wrangler deploy --config worker/wrangler.toml
   ```

   Cloudflare 会给出 `https://<worker>.<account>.workers.dev` 地址。把该地址填进 `sync-config.js` 的 `apiBase`，然后按常规流程推送静态站点。

5. 在 Cloudflare 对 `/api/auth` 启用速率限制（例如每 IP 每 15 分钟最多 10 次登录尝试），确认 Workers KV 已绑定。先用私人窗口验证登录、选择一篇候选、退出后重新登录仍能看到选择。

## 本地半月任务

`scripts/update-content.sh` 会先运行 `scripts/sync-interests.py`。配置缺失或请求失败时会停止本地内容周期，避免误用过期兴趣队列。配置成功后，任务将 API 返回的兴趣 ID 与本期 `candidates.js` 对照，只把当前候选中仍存在的选择写入 `content/private/interest-queue.json`。该目录在 `.gitignore` 中，文件权限为仅当前用户可读写；严禁提交、推送或把队列内容贴入公开日志。

更新任务开始时先读取这个队列，将“感兴趣”作为优先全文核查信号，并把“暂不考虑”排除在本期优先扩写之外。兴趣只是个人选题排序，不能替代论文新近性、原文获取、来源/结果核查和编辑判断。先写草稿与证据记录；发布前仍需用户复核，不自动发布未经确认的内容。同步失败时必须说明偏好不可用，不能当作“没有感兴趣论文”。

## 验证与边界

```sh
node --test worker/test/worker.test.mjs
python3 -m unittest scripts/test_sync_interests.py
python3 scripts/sync-interests.py --optional
```

Worker 测试覆盖错误 token、登录会话、兴趣读写、工作流密钥保护、输入验证和来源站点 CORS。GitHub Pages 上配置的是公开 API 地址，不是密钥。KV 用于小型偏好队列，不存文章全文。GitHub Pages origin 当前与同一 GitHub 用户名下的其他 Pages 项目共享；如需更强源站隔离，应在绑定独立自有域名后，把 CORS allowlist 改为该域名。
