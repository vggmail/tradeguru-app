import { Trade, DailyCheckin } from '../store/appStore';

export function computeBehavioralScores(trades: Trade[], checkins: DailyCheckin[]) {
  if (trades.length === 0) {
    return { discipline: 0, emotion: 0, process: 0 };
  }

  // 1. Process Score: Evaluates completion of rituals (pre-trade checks, reflections)
  // For every day a trade was placed, was there a checkin?
  const tradeDates = [...new Set(trades.map(t => t.date))];
  const checkinDates = new Set(checkins.map(c => c.date));
  let daysWithCheckin = 0;
  tradeDates.forEach(d => {
    if (checkinDates.has(d)) daysWithCheckin++;
  });
  
  // Did they write a lesson for each trade?
  const tradesWithLessons = trades.filter(t => t.lesson?.trim().length > 0).length;
  
  const processScore = Math.min(100, Math.round(
    ((daysWithCheckin / tradeDates.length) * 50) + 
    ((tradesWithLessons / trades.length) * 50)
  ));

  // 2. Discipline Score: Followed plan, respected max risk (if we had checkins)
  const tradesFollowingPlan = trades.filter(t => t.followedPlan).length;
  
  let riskViolations = 0;
  trades.forEach(t => {
    const dailyCheckin = checkins.find(c => c.date === t.date);
    if (dailyCheckin && t.riskPct > dailyCheckin.maxRisk) {
      riskViolations++;
    }
  });

  const disciplineScore = Math.min(100, Math.max(0, Math.round(
    ((tradesFollowingPlan / trades.length) * 100) - (riskViolations * 10)
  )));

  // 3. Emotional Stability Score: Non-impulsive trades, calm/focused emotions
  const impulsiveTrades = trades.filter(t => t.isImpulsive).length;
  const negativeEmotions = ['frustrated', 'revenge', 'fomo', 'fearful'];
  
  const emotionalTrades = trades.filter(t => 
    negativeEmotions.includes(t.emotionBefore) || negativeEmotions.includes(t.emotionAfter)
  ).length;

  const emotionScore = Math.min(100, Math.max(0, Math.round(
    100 - ((impulsiveTrades / trades.length) * 60) - ((emotionalTrades / trades.length) * 40)
  )));

  return {
    discipline: isNaN(disciplineScore) ? 0 : disciplineScore,
    emotion: isNaN(emotionScore) ? 0 : emotionScore,
    process: isNaN(processScore) ? 0 : processScore,
  };
}
