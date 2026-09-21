import confetti from "canvas-confetti";

const ENCOURAGEMENT = [
  "You're crushing your budget!",
  "Nice work!",
  "You're getting closer!",
  "Savings goal unlocked!",
  "You stayed under budget!",
  "Keep it going!",
  "Money mastery unlocked!",
  "Future you says thanks!"
];

export function celebrate(message) {
  const colors = ["#f97316", "#ef4444", "#f59e0b", "#22c55e", "#fb923c"];
  const end = Date.now() + 900;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({
    particleCount: 80,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.6 },
    colors
  });
  return message || ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
}

export function burstFromElement(element, message) {
  if (!element) return celebrate(message);
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;
  const colors = ["#f97316", "#ef4444", "#f59e0b", "#22c55e", "#fb923c"];
  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 40,
    origin: { x, y },
    colors
  });
  return message || ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
}

export { ENCOURAGEMENT };