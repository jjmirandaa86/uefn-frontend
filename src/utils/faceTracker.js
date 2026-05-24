import * as faceapi from "face-api.js";
import { getLocalDateFolder } from "./localDateFolder.js";

function todayDateFolder() {
  return getLocalDateFolder();
}

/**
 * Distancia euclidiana entre descriptores (face-api / FaceMatcher).
 * Valores típicos: < 0.45 muy seguro, 0.45–0.6 misma persona, > 0.65 otra persona.
 */
const MATCH_THRESHOLD = 0.6;

/** Al estabilizar un rostro nuevo, exige similitud entre frames consecutivos. */
const PENDING_MATCH_THRESHOLD = 0.55;

/** Frames seguidos antes de crear un id definitivo (evita ids fantasma). */
const STABLE_FRAMES_REQUIRED = 2;

/** Peso del descriptor ya conocido al actualizar (suaviza luz/ángulo). */
const DESCRIPTOR_BLEND = 0.78;

const STORAGE_PREFIX = "uefn-face-tracker-";

function storageKey() {
  return `${STORAGE_PREFIX}${todayDateFolder()}`;
}

function cloneDescriptor(descriptor) {
  return new Float32Array(
    descriptor instanceof Float32Array ? descriptor : descriptor,
  );
}

function blendDescriptor(stored, incoming, keepWeight = DESCRIPTOR_BLEND) {
  const w = keepWeight;
  for (let i = 0; i < stored.length; i++) {
    stored[i] = w * stored[i] + (1 - w) * incoming[i];
  }
}

function loadKnownFromStorage() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return { known: [], nextSeq: 1 };
    const parsed = JSON.parse(raw);
    const known = (parsed.known ?? []).map((entry) => ({
      id: entry.id,
      descriptor: new Float32Array(entry.descriptor),
    }));
    const nextSeq =
      typeof parsed.nextSeq === "number"
        ? parsed.nextSeq
        : known.length + 1;
    return { known, nextSeq };
  } catch {
    return { known: [], nextSeq: 1 };
  }
}

function saveKnownToStorage(known, nextSeq) {
  try {
    localStorage.setItem(
      storageKey(),
      JSON.stringify({
        known: known.map((e) => ({
          id: e.id,
          descriptor: Array.from(e.descriptor),
        })),
        nextSeq,
      }),
    );
  } catch {
    /* quota / private mode */
  }
}

function allocFaceId(nextSeq) {
  return `face-${String(nextSeq).padStart(4, "0")}`;
}

/**
 * Rastrea rostros en sesión con FaceMatcher-like logic (sin etiquetas/nombres).
 * face-api.js NO asigna id de persona; esto aproxima un id estable por descriptor.
 */
export function createFaceTracker() {
  let loadedDateFolder = todayDateFolder();
  const persisted = loadKnownFromStorage();
  /** @type {{ id: string; descriptor: Float32Array }[]} */
  const known = persisted.known;
  let nextSeq = persisted.nextSeq;

  /** @type {{ descriptor: Float32Array; hits: number; provisionalId: string } | null} */
  let pending = null;

  const persist = () => saveKnownToStorage(known, nextSeq);

  /** Al cambiar el día, recarga rostros de localStorage (clave por fecha). */
  const syncCalendarDay = () => {
    const today = todayDateFolder();
    if (today === loadedDateFolder) return;
    loadedDateFolder = today;
    const fresh = loadKnownFromStorage();
    known.length = 0;
    known.push(...fresh.known);
    nextSeq = fresh.nextSeq;
    pending = null;
  };

  const findBestMatch = (descriptor) => {
    let best = null;
    let bestDist = Infinity;
    for (const entry of known) {
      const dist = faceapi.euclideanDistance(descriptor, entry.descriptor);
      if (dist < bestDist) {
        bestDist = dist;
        best = entry;
      }
    }
    if (best && bestDist < MATCH_THRESHOLD) {
      return { entry: best, distance: bestDist };
    }
    return null;
  };

  return {
    /**
     * @param {Float32Array} descriptor
     * @returns {{ faceId: string; isStable: boolean; distance?: number }}
     */
    resolveFaceId(descriptor) {
      if (!descriptor?.length) {
        return { faceId: "face-unknown", isStable: false };
      }

      syncCalendarDay();

      const incoming = cloneDescriptor(descriptor);
      const match = findBestMatch(incoming);

      if (match) {
        blendDescriptor(match.entry.descriptor, incoming);
        pending = null;
        persist();
        return {
          faceId: match.entry.id,
          isStable: true,
          distance: match.distance,
        };
      }

      if (pending) {
        const dist = faceapi.euclideanDistance(incoming, pending.descriptor);
        if (dist < PENDING_MATCH_THRESHOLD) {
          pending.hits += 1;
          blendDescriptor(pending.descriptor, incoming, 0.55);
          if (pending.hits >= STABLE_FRAMES_REQUIRED) {
            const id = allocFaceId(nextSeq);
            nextSeq += 1;
            known.push({
              id,
              descriptor: cloneDescriptor(pending.descriptor),
            });
            pending = null;
            persist();
            return { faceId: id, isStable: true };
          }
          return { faceId: pending.provisionalId, isStable: false };
        }
        pending = null;
      }

      pending = {
        descriptor: incoming,
        hits: 1,
        provisionalId: `face-pending-${Date.now().toString(36)}`,
      };
      return { faceId: pending.provisionalId, isStable: false };
    },

    /** Rostros ya confirmados en la sesión / hoy. */
    getKnownFaceIds() {
      return known.map((e) => e.id);
    },

    reset() {
      known.length = 0;
      nextSeq = 1;
      pending = null;
      try {
        localStorage.removeItem(storageKey());
      } catch {
        /* ignore */
      }
    },
  };
}
