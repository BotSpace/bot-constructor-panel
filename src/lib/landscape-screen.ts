// @ts-nocheck

export const handleStartWork = async () => {
  try {
    const element = document.documentElement; // Butun sahifa

    if (element.requestFullscreen) {
      await element.requestFullscreen();
    }

    // Ekranni gorizontalga qulflash
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (error) {
    console.error("Orientation lock xatosi:", error);
  }
};
