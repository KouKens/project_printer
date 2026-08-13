#!/usr/bin/env node
/**
 * プリンターへの書き込みを止める PreToolUse フック。
 *
 * permissions.deny は「コマンドとして実行される snmpset」しか塞げない。
 * 複合コマンド（cd x && snmpset ...）や、net-snmp の session.set() を呼ぶ
 * スクリプトはすり抜けるので、ここで中身を見て落とす。
 *
 * 標準入力にツール呼び出しの JSON が渡る。止めるときだけ JSON を返す。
 */

const WRITE_COMMAND = /\bsnmp(set|usm|vacm)\b/i;

/**
 * net-snmp の書き込みは session.set([varbind, ...], cb) の形。
 * Map#set は第 1 引数が配列リテラルにならないので、"[" まで見れば
 * colorants.set(index, name) のような正当なコードは巻き込まない。
 */
const WRITE_CALL = /\.set\s*\(\s*\[/;
const MENTIONS_SNMP = /snmp/i;

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(raw || '{}');
  } catch {
    process.exit(0); // 解釈できない入力で作業を止めない
  }

  const tool = payload.tool_name ?? '';
  const input = payload.tool_input ?? {};

  if (tool === 'Bash' || tool === 'PowerShell') {
    const command = String(input.command ?? '');
    if (WRITE_COMMAND.test(command)) {
      deny(
        'プリンターの設定変更は禁止されています（CLAUDE.md「してはいけないこと」）。' +
          'snmpset / snmpusm / snmpvacm は実行できません。読み取りは snmpget / snmpwalk を使ってください。',
      );
    }
  }

  if (tool === 'Write' || tool === 'Edit' || tool === 'NotebookEdit') {
    const body = String(input.content ?? input.new_string ?? '');
    if (MENTIONS_SNMP.test(body) && WRITE_CALL.test(body)) {
      deny(
        'SNMP の書き込み処理（session.set）は追加できません。' +
          'このシステムはプリンターを読み取るだけで、機器の設定は変更しません（CLAUDE.md「してはいけないこと」）。',
      );
    }
  }

  process.exit(0);
});
