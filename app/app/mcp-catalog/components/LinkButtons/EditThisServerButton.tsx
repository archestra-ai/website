import { generateUrlToIndividualMcpCatalogJsonFile } from '@mcpCatalog/lib/urls';

import LinkButton, { CommonLinkButtonProps } from './LinkButton';

type EditThisServerButtonProps = CommonLinkButtonProps & {
  serverId: string;
};

const EditThisServerButton = ({ serverId, ...linkButtonProps }: EditThisServerButtonProps) => (
  <LinkButton
    link={generateUrlToIndividualMcpCatalogJsonFile(serverId, true)}
    additionalClassNames="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    {...linkButtonProps}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
    Edit This Server
  </LinkButton>
);

export default EditThisServerButton;
