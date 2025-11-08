
import { AspectRatio, LightingStyle, CameraPerspective } from './types';

export const ASPECT_RATIO_OPTIONS = [
  { value: AspectRatio.SQUARE, label: 'Square (1:1)' },
  { value: AspectRatio.PORTRAIT, label: 'Portrait (9:16)' },
  { value: AspectRatio.LANDSCAPE, label: 'Landscape (16:9)' },
];

export const LIGHTING_STYLE_OPTIONS = [
  { value: LightingStyle.STUDIO, label: 'Studio' },
  { value: LightingStyle.NATURAL, label: 'Natural Light' },
  { value: LightingStyle.DRAMATIC, label: 'Dramatic' },
  { value: LightingStyle.SOFT, label: 'Soft & Ethereal' },
  { value: LightingStyle.HIGH_KEY, label: 'High-Key' },
];

export const CAMERA_PERSPECTIVE_OPTIONS = [
  { value: CameraPerspective.EYE_LEVEL, label: 'Eye-Level' },
  { value: CameraPerspective.HIGH_ANGLE, label: 'High-Angle' },
  { value: CameraPerspective.LOW_ANGLE, label: 'Low-Angle' },
  { value: CameraPerspective.MACRO, label: 'Macro / Close-up' },
  { value: CameraPerspective.BIRDS_EYE, label: 'Bird\'s-Eye View' },
];
