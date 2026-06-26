import time
from app.config import GESTURE_COOLDOWN, SWIPE_THRESHOLD, SWIPE_TIME_LIMIT


class GestureEngine:
    def __init__(self):
        self.last_gesture_time = 0
        self.swipe_buffer = []

    def process_gesture(self, gesture: str, hand_x: float, hand_y: float, timestamp: float) -> str | None:
        now = time.time()

        if now - self.last_gesture_time < GESTURE_COOLDOWN:
            return None

        if gesture == "swipe_right" or gesture == "swipe_left":
            confirmed = self._detect_swipe(gesture, hand_x, timestamp)
            if not confirmed:
                return None

        command = self._gesture_to_command(gesture)
        if command:
            self.last_gesture_time = now
            return command

        return None

    def _gesture_to_command(self, gesture: str) -> str | None:
        mapping = {
            "thumbs_up": "play",
            "open_palm": "pause",
            "swipe_right": "next",
            "swipe_left": "previous",
        }
        return mapping.get(gesture)

    def _detect_swipe(self, gesture: str, hand_x: float, timestamp: float) -> bool:
        self.swipe_buffer.append((hand_x, timestamp))
        self.swipe_buffer = [
            (x, t) for x, t in self.swipe_buffer
            if timestamp - t <= SWIPE_TIME_LIMIT
        ]

        if len(self.swipe_buffer) < 5:
            return False

        start_x = self.swipe_buffer[0][0]
        dx = hand_x - start_x

        if gesture == "swipe_right" and dx > SWIPE_THRESHOLD:
            self.swipe_buffer.clear()
            return True
        elif gesture == "swipe_left" and dx < -SWIPE_THRESHOLD:
            self.swipe_buffer.clear()
            return True

        return False

    def reset_cooldown(self):
        self.last_gesture_time = 0


gesture_engine = GestureEngine()
