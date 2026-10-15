/** Sharing files made on the phone: the visit summary PDF and journal exports. */
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { withSystemUI } from './system';

function cacheFile(name: string): File {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  return file;
}

export async function sharePdf(html: string, fileName: string, title: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html, width: 612, height: 792 });
  const made = new File(uri);
  const named = cacheFile(fileName);
  made.moveSync(named);
  await withSystemUI(() => Sharing.shareAsync(named.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title }));
}

export async function printHtml(html: string): Promise<void> {
  await withSystemUI(() => Print.printAsync({ html, width: 612, height: 792 }));
}

export async function shareTextFile(fileName: string, content: string, mimeType: string, uti: string, title: string): Promise<void> {
  const file = cacheFile(fileName);
  file.create();
  file.writeSync(content);
  await withSystemUI(() => Sharing.shareAsync(file.uri, { mimeType, UTI: uti, dialogTitle: title }));
}
