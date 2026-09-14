require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

// ============================================
// [1] Telegram Broadcasting
// ============================================
// ⚠️ 사령관님의 편의를 위해 직접 하드코딩 주입됨 (자동 배포용)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8902754700:AAHYzkBFKkm9tPVh_2RTbtAPekDujHS6FeE";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "@LgaiEmpireOfficial";

async function postToTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("⚠️ [Broadcaster] Telegram keys missing. Skipping Telegram post.");
    return;
  }
  
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (response.ok) {
      console.log("🚀 [Broadcaster] Successfully posted to Telegram!");
    } else {
      console.error("❌ [Broadcaster] Telegram post failed:", await response.text());
    }
  } catch (error) {
    console.error("❌ [Broadcaster] Telegram Error:", error.message);
  }
}

// ============================================
// [2] Twitter Broadcasting
// ============================================
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

let twitterClient = null;
if (TWITTER_API_KEY && TWITTER_API_SECRET && TWITTER_ACCESS_TOKEN && TWITTER_ACCESS_SECRET) {
  twitterClient = new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
  });
}

async function postToTwitter(message) {
  if (!twitterClient) {
    console.log("⚠️ [Broadcaster] Twitter keys missing. Skipping Twitter post.");
    return;
  }

  try {
    // 트위터는 280자 제한이 있으므로 너무 길면 자름
    let tweetText = message;
    if (tweetText.length > 275) {
      tweetText = tweetText.substring(0, 275) + "...";
    }
    
    await twitterClient.v2.tweet(tweetText);
    console.log("🐦 [Broadcaster] Successfully posted to Twitter(X)!");
  } catch (error) {
    console.error("❌ [Broadcaster] Twitter Error:", error.message);
  }
}

// ============================================
// [3] Main Broadcaster Function
// ============================================
async function broadcast(title, content) {
  const fullMessage = `<b>${title}</b>\n\n${content}\n\n🌐 https://legionai-hub.vercel.app/`;
  const tweetMessage = `${title}\n\n${content}\n\n$LGAI`;
  
  // 텔레그램과 트위터 동시 발사
  await Promise.all([
    postToTelegram(fullMessage),
    postToTwitter(tweetMessage)
  ]);
}

module.exports = { broadcast };
