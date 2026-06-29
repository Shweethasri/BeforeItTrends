/**
 * Utility to extract frames from a video file
 */
export async function extractFramesFromVideo(file: File, frameCount: number = 3): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    const frames: string[] = [];
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const interval = duration / (frameCount + 1);
      let currentFrame = 1;

      const captureFrame = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.8));
        }

        if (currentFrame < frameCount) {
          currentFrame++;
          video.currentTime = currentFrame * interval;
        } else {
          URL.revokeObjectURL(video.src);
          resolve(frames);
        }
      };

      video.onseeked = captureFrame;
      video.currentTime = interval;
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video for frame extraction."));
    };
  });
}

/**
 * Utility to get base64 from a file (for images)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
