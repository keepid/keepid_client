import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
} from 'pdf-lib';

export type FieldKind = 'text' | 'checkbox' | 'radio' | 'choice' | 'other';

export interface PdfReadback {
  /** Field value by field name. A checked checkbox reads as "On"; its export token is not readable. */
  values: Record<string, string>;
  kinds: Record<string, FieldKind>;
  /** Export values of radio and option-list fields, for diagnosing tokens that match nothing. */
  options: Record<string, string[]>;
}

/** Reads every AcroForm field value from a filled PDF, keyed by field name. */
export async function readPdfFields(bytes: ArrayBuffer): Promise<PdfReadback> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const values: Record<string, string> = {};
  const kinds: Record<string, FieldKind> = {};
  const options: Record<string, string[]> = {};
  doc.getForm().getFields().forEach((field) => {
    const name = field.getName();
    if (field instanceof PDFTextField) {
      values[name] = field.getText() ?? '';
      kinds[name] = 'text';
    } else if (field instanceof PDFCheckBox) {
      values[name] = field.isChecked() ? 'On' : '';
      kinds[name] = 'checkbox';
    } else if (field instanceof PDFRadioGroup) {
      values[name] = field.getSelected() ?? '';
      kinds[name] = 'radio';
      options[name] = field.getOptions();
    } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
      values[name] = field.getSelected().join(', ');
      kinds[name] = 'choice';
      options[name] = field.getOptions();
    } else {
      values[name] = '';
      kinds[name] = 'other';
    }
  });
  return { values, kinds, options };
}
