import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers';

import PreviewBooleanCell, { previewBooleanCellTester } from './PreviewBooleanCell';
import PreviewControl, { previewControlTester } from './PreviewControl';
import PreviewGroupLayout, { previewGroupLayoutTester } from './PreviewGroupLayout';
import StepperLayoutRenderer, { stepperLayoutTester } from './StepperLayoutRenderer';

export const interactiveFormRenderers = [
  { tester: stepperLayoutTester, renderer: StepperLayoutRenderer },
  { tester: previewGroupLayoutTester, renderer: PreviewGroupLayout },
  { tester: previewControlTester, renderer: PreviewControl },
  ...vanillaRenderers,
];

export const interactiveFormCells = [
  { tester: previewBooleanCellTester, cell: PreviewBooleanCell },
  ...vanillaCells,
];
