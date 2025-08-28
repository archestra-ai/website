export type CommonLinkButtonProps = {
  fullWidth?: boolean;
  bold?: boolean;
  additionalClassNames?: string;
};

type LinkButtonProps = CommonLinkButtonProps & {
  link: string;
};

const LinkButton = ({
  link,
  children,
  fullWidth,
  bold,
  additionalClassNames,
}: React.PropsWithChildren<LinkButtonProps>) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm${fullWidth ? ' w-full' : ''} ${bold ? ' sm:text-base' : ''} ${additionalClassNames}`}
  >
    {children}
  </a>
);

export default LinkButton;
