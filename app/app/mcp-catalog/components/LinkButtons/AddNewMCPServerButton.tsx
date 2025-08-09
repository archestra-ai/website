import constants from '@constants';

import LinkButton, { CommonLinkButtonProps } from './LinkButton';

const {
  github: {
    archestra: {
      website: { editMcpCatalogJsonFileUrl },
    },
  },
} = constants;

interface AddNewMCPServerButtonProps extends CommonLinkButtonProps {
  color: 'purple' | 'grey';
}

export default function AddNewMCPServerButton({
  color,
  additionalClassNames,
  ...linkButtonProps
}: AddNewMCPServerButtonProps) {
  let colorClassNames;
  if (color === 'purple') {
    colorClassNames = 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700';
  } else if (color === 'grey') {
    colorClassNames = 'bg-gray-600 hover:bg-gray-700';
  }

  return (
    <LinkButton
      link={editMcpCatalogJsonFileUrl}
      additionalClassNames={`${colorClassNames} ${additionalClassNames}`}
      {...linkButtonProps}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add New MCP Server
    </LinkButton>
  );
}
