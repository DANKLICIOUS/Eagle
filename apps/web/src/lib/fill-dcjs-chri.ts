import { PDFDocument, PDFName } from 'pdf-lib';
import {
  DCJS_CHRI_ACCESS,
  type DcjsChriAnswers,
  dcjsChriChecks,
  dcjsChriTextValues,
} from '@plate/skill-packs';

export async function fillDcjsChriPdf(answers: DcjsChriAnswers): Promise<Uint8Array> {
  const res = await fetch(DCJS_CHRI_ACCESS.templatePath);
  if (!res.ok) throw new Error('Could not load the DCJS form.');
  const bytes = await res.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = doc.getForm();
  const texts = dcjsChriTextValues(answers);
  for (const [name, value] of Object.entries(texts)) {
    if (!value) continue;
    form.getTextField(name).setText(value);
  }
  for (const name of dcjsChriChecks(answers)) {
    const field = form.getCheckBox(name);
    try {
      field.check();
    } catch {
      field.acroField.setValue(PDFName.of('On'));
    }
  }
  form.updateFieldAppearances();
  return doc.save({ updateFieldAppearances: true });
}

export function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
