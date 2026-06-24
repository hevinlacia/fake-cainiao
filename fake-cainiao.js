// Mock 菜鸟云打印客户端 - 让前端以为打印成功
// 监听 ws://127.0.0.1:13528,与 WMS 前端默认端口一致
const WebSocket = require('ws');

// 模拟打印机列表 - 你想加多少加多少,前端只用 name 字段做下拉
const PRINTERS = [
  { name: 'Mock-A4',         displayName: 'Mock A4 打印机',     status: 0 },
  { name: 'Mock-Label-100',  displayName: 'Mock 标签机 100x100', status: 0 },
  { name: 'Mock-Label-76',   displayName: 'Mock 标签机 76x130',  status: 0 },
  { name: 'Mock-Receipt',    displayName: 'Mock 小票打印机',     status: 0 },
  { name: 'Mock-Express',    displayName: 'Mock 面单打印机',     status: 0 },
];

const wss = new WebSocket.Server({ host: '127.0.0.1', port: 13528 });

wss.on('connection', (ws, req) => {
  console.log(`[+] 前端已连接 from ${req.socket.remoteAddress}`);
  ws.on('message', (data) => {
    const r = JSON.parse(data.toString());
    console.log(`[<-] cmd=${r.cmd} requestID=${r.requestID || '-'}`);
    if (r.cmd === 'getPrinters') {
      // 关键:status='success' 是 React 端必查项(socket.ts:147)
      ws.send(JSON.stringify({
        requestID: r.requestID, version: '1.0', cmd: 'getPrinters',
        status: 'success',
        printers: PRINTERS,
        defaultPrinter: PRINTERS[0].name,
      }));
      console.log(`[->] getPrinters -> ${PRINTERS.length} 台,默认=${PRINTERS[0].name}`);
    } else if (r.cmd === 'print') {
      ws.send(JSON.stringify({
        requestID: r.requestID, version: '1.0', cmd: 'print',
        status: 'success', taskID: r.task && r.task.taskID, previewURL: ''
      }));
      console.log(`[->] print -> success printer=${r.task && r.task.printer}`);
    }
  });
  ws.on('close', () => console.log('[-] 前端已断开'));
});

console.log('Mock 菜鸟打印客户端: ws://127.0.0.1:13528  (Ctrl+C 退出)');
console.log('可选打印机:');
PRINTERS.forEach(p => console.log('  -', p.name, '(' + p.displayName + ')'));
