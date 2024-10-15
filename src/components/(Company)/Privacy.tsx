/* eslint-disable react/no-danger */
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AppConfig } from '@/utils/appConfig';

import { Container } from '../GeneralContainers';

const Privacy = () => {
  const t = useTranslations('Privacy');

  const tableOfContents = t.raw('table_of_contents') as Array<{
    title: string;
    value: string;
  }>;

  type Section = {
    title: string;
    content: string;
    sub_sections?: Record<string, { title: string; content: string } | null>;
  };

  const sections = t.raw('sections') as Record<string, Section>;

  return (
    <Container className="">
      <h1 className="my-8 text-4xl">{t('title')}</h1>
      <div className="h-full pt-10">
        <section className="flex h-1/2 place-content-center py-8">
          <div className="z-30 place-content-center">
            <div className="mb-5 w-full text-center text-2xl font-extrabold leading-7">
              {t('title')}
            </div>
            <div className="text-left text-base">
              <div id="top">
                {t('intro', {
                  appUrl: AppConfig.url,
                })}
              </div>
              <br />
              <br />
              {t('update_notice')}
              <br />
              <br />
              {t('read_request')}
            </div>
            <h6 className="mt-8  text-2xl font-bold text-blue-600 dark:text-blue-400">
              {t('table_of_contents_title')}
            </h6>
            <ul className="list-inside list-disc font-bold text-blue-600 dark:text-blue-400">
              {tableOfContents.map((item) => (
                <li key={item.title}>
                  <Link
                    href={`#${item.title.replaceAll('_', '-')}`}
                    className="hover:underline"
                  >
                    {item.value}
                  </Link>
                </li>
              ))}{' '}
            </ul>

            {Object.entries(sections).map(([sectionKey, sectionValue]) => (
              <div
                key={sectionKey}
                className="mt-8 text-left text-base"
                id={sectionKey.replaceAll('_', '-')}
              >
                <h6 className="mb-4 font-bold text-blue-600 dark:text-blue-400">
                  {sectionValue.title}
                </h6>
                <div
                  dangerouslySetInnerHTML={{ __html: sectionValue.content }}
                />
                {sectionValue.sub_sections && (
                  <>
                    {Object.entries(sectionValue.sub_sections).map(
                      ([subSectionKey, subSectionValue]) => {
                        if (
                          typeof subSectionValue === 'object' &&
                          subSectionValue !== null &&
                          'title' in subSectionValue &&
                          'content' in subSectionValue
                        ) {
                          return (
                            <div key={subSectionKey}>
                              <h6 className="my-4 text-blue-600 dark:text-blue-400">
                                {subSectionValue.title as React.ReactNode}
                              </h6>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: subSectionValue.content as string,
                                }}
                              />
                            </div>
                          );
                        }
                        return null;
                      },
                    )}
                  </>
                )}
                {sectionKey === 'contact_us' && (
                  <p>
                    {t('contact_section.email_label')} {AppConfig.email}
                  </p>
                )}
              </div>
            ))}

            <p className="my-4 text-blue-600 dark:text-blue-400">
              <Link href="#top">{t('back_to_top')}</Link>
            </p>
          </div>
        </section>
      </div>
    </Container>
  );
};

export default Privacy;
