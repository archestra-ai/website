import constants from '@constants';

import LinkButton, { CommonLinkButtonProps } from './LinkButton';

const {
  github: {
    archestra: {
      website: { newIssueUrl },
    },
  },
} = constants;

type ReportAnIssueButtonProps = CommonLinkButtonProps & {
  variant?: 'report-issue' | 'suggest-configuration';
  issueUrlParams?: string;
};

const ReportAnIssueButton = ({
  issueUrlParams,
  variant = 'report-issue',
  ...linkButtonProps
}: ReportAnIssueButtonProps) => {
  let text;
  if (variant === 'report-issue') {
    text = 'Report an Issue';
  } else {
    text = 'Suggest Configuration';
  }

  let colorClassNames;
  if (variant === 'report-issue') {
    colorClassNames = 'bg-gray-500 hover:bg-gray-600';
  } else {
    colorClassNames = 'bg-blue-600 hover:bg-blue-700';
  }

  return (
    <LinkButton link={`${newIssueUrl}?${issueUrlParams}`} additionalClassNames={colorClassNames} {...linkButtonProps}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {text}
    </LinkButton>
  );
};

export default ReportAnIssueButton;
