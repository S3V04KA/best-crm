import { ApiParam } from '@nestjs/swagger';

export const ApiWorkspaceId = () =>
  ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'ID of the workspace',
    required: true,
    schema: { format: 'uuid' },
  });
