const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

// ── Firebase 初始化（直接內嵌金鑰，不需要環境變數）──
admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   "score-tracker-ca2dd",
    clientEmail: "firebase-adminsdk-fbsvc@score-tracker-ca2dd.iam.gserviceaccount.com",
    privateKey:  "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCmQ77BAjTOHUqU\npnMjQ3HKeTddEQoBn3z6q4AalvVk87sLao1APATJ+iJQDXQnleJuhykby10pgpWe\nwJW+BKxocJX1hw450dhZyV5rv1AZtZGfXscQb+mGRzojdysyATBe1bq64QOEci4b\nbK0FyXI/4ijEryI6HrdScjqy251SqRkz2Chh6pKv/OTqg/lpqV2LQsYcCr+/Y02R\nU1wOlePDjDLCNEvN6uePxuemZd0aJsupVyextm+H0IPHrg8pFpXIZWEHAYm8AihB\nZ5yPrY96x8rBDERrD5ESYT5grixDJr9fLSlnZ/4eVmri6YMsQenZVpFYjq9h6RWM\nbYxpX1j1AgMBAAECggEABXTUMgPXRUtfSvUScr4QIi+rsjVwsWBxSs2tiNHa8Ery\nYLvIsmq10oYPsbZbUUBBO9TaM8QPBOF49QqHb4K6QLwvI61guWOKWNn7rAgNgiZ8\nBrGm0UKG9KXqQcczpvK0imwzslXXlnVjz3kXzYiQpAmRQnEn66Xd6MoAZKXB6jg+\nXbd3hsZkDeF3CvV8Kc81FV80sQ9MNxCWeT/DVbbxkEiuFQ+q9RAqAV9aDpG3hfbn\n4jvHWVrJLZ9iz3VT+bXfRrrsDDTh7vCObejGiXQ8H1vlGBbm/dv/rWlQrCcHB9FM\nDlqklztd7DNWaTkDtKKZafAfovcXXFmLt87DiYOZqQKBgQDcxN1lZ7qsLTD7zso0\n1tW5fAHbKLg8JV+FUrQHfjw1xS4jzs8d7kMJi75LPQxwK4++yOw6NbApdfzQgASJ\nKcbM96jxmq7mjyq0qi+nm7XGtv6RM1wcmiouhB72UISpzd1M5De4zcCYrHnnc3sl\nSj+FNyjz3GHv/o25FrV/g1yErQKBgQDAzDLTIueU00HgbaS+rSW5PLe667St/fZj\nD23k1CnMFKf9qbd8KrBHxJvMPZLnt8GXWXM4Vl2i88tgVfV4qVyU4IsQoa9+Fto0\na6jcjfzksgx7OqqU0JHh3fqd06wING/g66ehttnBrwLMJ4RlPqqS/ZZhg5ZB0gE4\nDfztO9BmaQKBgQCNAAsrFfoKt34+hU9uOfwc0E/bKoGooHIGk9C5rG1GJl6WriJo\nSmF0elUadq44Agp33pnJf7q4cEv82paLCCyZgl/bl2C3jp7G7p8rHG8XsI6cLEJb\nXjcsqGOiC8D/NqVt06CnHnowyI+/PGldYrN5IMa+IXZHsrvPh+p5u2terQKBgQCH\nr25Zj6gh4mfrdd7K3vq8mhHIOFhpV2GOp+40bGiaGzN7X3UlqrlzWNg47mC0OWvC\ng46GaKnvo9pPC0/9wlvI3xqf8tqaR6T73YTy6+6+WNxV4ZzprLvulRXq+2yIPbc7\nOT45noE0QWIbofgYdPkBB/1M1Znq6sw20gleQIlTeQKBgQDVmS8Nzb/osFDWjkCM\n0sx61nvFA+IGMhqQ6x9Xe3oRZ0P6Prijqx6OHxDyjLfDliwpxQa9IOXBOPh9s8jB\nu4ZZ5/dO0Xur5DpLnVpMDHFiDjd3864YaiZCuBF0l5JgFbzjl7XyuWwYff33Pzwb\nRF3ufOKZ27y8WlGQnM78fiV0bw==\n-----END PRIVATE KEY-----\n",
  }),
  databaseURL: "https://score-tracker-ca2dd-default-rtdb.firebaseio.com",
});
const db = admin.database();

// ── Discord Token 與 Client ID ──
const DISCORD_TOKEN     = "MTA2NTQ3NDQ4OTM4MDUxOTk3Ng.GXeUP7.8nzF7VjvjaIzKCc3MyJMz6kXjmkC6IfOcqU524";
const DISCORD_CLIENT_ID = "1065474489380519976";

// ── Discord Client ──
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ── 斜線指令定義 ──
const commands = [
  new SlashCommandBuilder()
    .setName('ptcg_log')
    .setDescription('查詢 PTCG 戰績')
    .addSubcommand(sub =>
      sub.setName('show')
        .setDescription('顯示指定隊伍的戰績')
        .addStringOption(opt =>
          opt.setName('隊伍')
            .setDescription('隊伍名稱，例如：大嘟嘟')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('all')
        .setDescription('顯示所有隊伍的分數總覽')
    ),
].map(cmd => cmd.toJSON());

// ── 註冊斜線指令 ──
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
(async () => {
  try {
    console.log('正在註冊斜線指令...');
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
    console.log('斜線指令註冊完成！');
  } catch (err) {
    console.error('指令註冊失敗：', err);
  }
})();

// ── Bot 就緒 ──
client.once('ready', () => {
  console.log(`✅ Bot 已上線：${client.user.tag}`);
});

// ── 處理斜線指令 ──
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'ptcg_log') return;

  await interaction.deferReply();

  const sub = interaction.options.getSubcommand();

  try {
    const [teamsSnap, logsSnap] = await Promise.all([
      db.ref('teams').once('value'),
      db.ref('logs').once('value'),
    ]);
    const teamsData = teamsSnap.val() || {};
    const logsData  = logsSnap.val()  || {};

    // logs 轉陣列，最新在前
    const logList = Object.entries(logsData)
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.key.localeCompare(a.key));

    // ── /ptcg_log show 隊伍名稱 ──
    if (sub === 'show') {
      const targetName = interaction.options.getString('隊伍');
      const teamEntry  = Object.entries(teamsData).find(([, t]) => t.name === targetName);

      if (!teamEntry) {
        await interaction.editReply(`❌ 找不到隊伍「${targetName}」，請確認名稱是否正確。`);
        return;
      }
      const [teamId, teamInfo] = teamEntry;

      // 篩選這隊的得分紀錄
      const teamLogs = logList.filter(l => l.teamId === teamId && (l.bgClass === 'win' || l.bgClass === 'loss'));
      const wins     = teamLogs.filter(l => l.bgClass === 'win').length;
      const losses   = teamLogs.filter(l => l.bgClass === 'loss').length;
      const total    = wins + losses;
      const winRate  = total > 0 ? ((wins / total) * 100).toFixed(1) : '—';

      // 最近 5 筆
      const recent = teamLogs.slice(0, 5).map(l => {
        const dateMatch = l.html.match(/(\d{7,8})/);
        const date      = dateMatch ? dateMatch[1] : '—';
        const result    = l.bgClass === 'win' ? '🟢 贏' : '🔴 輸';
        const mainMatch = l.html.match(/主：([^<　\s]+)/);
        const subMatch  = l.html.match(/副：([^<　\s]+)/);
        const main      = mainMatch ? mainMatch[1] : '';
        const subP      = subMatch  ? subMatch[1]  : '';
        const pokemon   = [main ? `主:${main}` : '', subP ? `副:${subP}` : ''].filter(Boolean).join(' ');
        return `${result} ${date} ${pokemon || ''}`.trim();
      });

      const score  = teamInfo.score ?? 0;
      const spent  = teamInfo.spent ?? 0;
      const remain = score - spent;

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${targetName} 的戰績`)
        .setColor(wins >= losses ? 0x1D9E75 : 0xE24B4A)
        .addFields(
          { name: '🎯 目前得分',  value: `**${score}** 分`,    inline: true },
          { name: '💸 花費點數',  value: `**${spent}**`,       inline: true },
          { name: '💰 剩餘點數',  value: `**${remain}**`,      inline: true },
          { name: '📈 勝負紀錄',  value: `🟢 贏 **${wins}** 場　🔴 輸 **${losses}** 場　勝率 **${winRate}%**` },
          { name: '🕐 最近 5 場', value: recent.length > 0 ? recent.join('\n') : '尚無紀錄' },
        )
        .setFooter({ text: 'PTCG 計分板' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    // ── /ptcg_log all ──
    } else if (sub === 'all') {
      const sorted = Object.values(teamsData).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      const lines = sorted.map((t, i) => {
        const remain = (t.score ?? 0) - (t.spent ?? 0);
        const medal  = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        return `${medal} **${t.name}**　得分 ${t.score ?? 0}　剩餘 ${remain}`;
      });

      const embed = new EmbedBuilder()
        .setTitle('🏆 所有隊伍分數總覽')
        .setColor(0x185FA5)
        .setDescription(lines.length > 0 ? lines.join('\n') : '尚無隊伍資料')
        .setFooter({ text: 'PTCG 計分板' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }

  } catch (err) {
    console.error(err);
    await interaction.editReply('❌ 查詢失敗，請稍後再試。');
  }
});

client.login(DISCORD_TOKEN);
