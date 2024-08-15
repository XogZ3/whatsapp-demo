import { cn } from '@/libs/utils';

export const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex flex-col space-y-2 w-full', className)}>
      {children}
    </div>
  );
};

export const ErrorMessage = ({ message }: { message: string }) => {
  return <p className="text-xs text-red-500">{message}</p>;
};

// Main Component
type MainProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

const Main = ({ children, className, id }: MainProps) => {
  return (
    <main
      className={cn(
        // `Main` Specific Styles
        'max-w-none prose-p:m-0',
        // General Prose
        'prose prose-neutral prose:font-sans dark:prose-invert xl:prose-lg',
        // Prose Headings
        'prose-headings:font-normal prose-headings:my-1',
        // Prose Strong
        'prose-strong:font-semibold',
        // Inline Links
        'prose-a:no-underline prose-a:text-foreground/75 prose-a:transition-all',
        // Inline Link Hover
        'hover:prose-a:decoration-primary hover:prose-a:text-foreground',
        // Blockquotes
        'prose-blockquote:not-italic',
        // Pre and Code Blocks
        'prose-pre:border prose-pre:bg-muted/25 prose-pre:text-foreground',
        className,
      )}
      id={id}
    >
      {children}
    </main>
  );
};

// Section Component
type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  noYPadding?: boolean;
};

const Section = ({
  children,
  className,
  id,
  noYPadding = false,
}: SectionProps) => {
  return (
    <section
      className={cn({ '': !noYPadding, 'py-4': noYPadding }, className)}
      id={id}
    >
      {children}
    </section>
  );
};

// Container Component
type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  noYPadding?: boolean;
};

const Container = ({
  children,
  className,
  id,
  noYPadding = false,
}: ContainerProps) => {
  return (
    <div
      className={cn(
        'max-w-6xl mx-auto',
        { 'p-6 sm:p-8': !noYPadding, 'px-6 sm:px-8': noYPadding },
        className,
      )}
      id={id}
    >
      {children}
    </div>
  );
};

type GlassContainerProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

const GlassContainer = ({ children, className, id }: GlassContainerProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border dark:border-slate-100/20 border-slate-800/20 bg-slate-300/10 dark:bg-slate-200/10 p-4 md:p-3 lg:p-4 backdrop-blur-md',
        className,
      )}
      id={id}
    >
      {children}
    </div>
  );
};

type GlassContainerTitleProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};
const GlassContainerTitle = ({
  children,
  className,
  id,
}: GlassContainerTitleProps) => {
  return (
    <div
      className={cn(
        'mb-2 text-xl md:text-base lg:text-base xl:text-lg 2xl:text-3xl',
        className,
      )}
      id={id}
    >
      {children}
    </div>
  );
};

export { Container, GlassContainer, GlassContainerTitle, Main, Section };
