'use client';

export default function GlobalError(props: { params: { locale: string } }) {
  return (
    <html lang={props.params.locale}>
      <body>err</body>
    </html>
  );
}
