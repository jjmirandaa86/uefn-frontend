export async function loadFaceModels() {
  // Models should live in /public/models when face-api.js is connected.
  return { ready: false, message: 'Modelos pendientes de instalar en public/models' };
}

export async function detectEmotionFrame() {
  return {
    emotion: 'happy',
    confidence: 0.92,
    ageEstimate: 24,
    genderEstimate: 'Masculino',
  };
}
