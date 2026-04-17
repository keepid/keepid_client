import type { ResolvedProfiles } from '../../utils/directives';
import { getByPath, resolveDirectiveFromProfiles } from '../../utils/directives';

type AttachmentFieldResolver = {
  fieldName: string;
  resolve: (profiles: ResolvedProfiles | null | undefined) => unknown;
};

function buildClientFullName(profiles: ResolvedProfiles | null | undefined): string | undefined {
  const clientProfile = profiles?.client;
  if (!clientProfile) return undefined;

  const first = String(getByPath(clientProfile, 'currentName.first') ?? '').trim();
  const middle = String(getByPath(clientProfile, 'currentName.middle') ?? '').trim();
  const last = String(getByPath(clientProfile, 'currentName.last') ?? '').trim();
  const suffix = String(getByPath(clientProfile, 'currentName.suffix') ?? '').trim();
  const fullName = [first, middle, last, suffix].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  return fullName || undefined;
}

const V0_ATTACHMENT_FIELD_MAP: AttachmentFieldResolver[] = [
  {
    fieldName: 'client name',
    resolve: (profiles) => resolveDirectiveFromProfiles('client.$fullName', profiles) ?? buildClientFullName(profiles),
  },
  {
    fieldName: 'client dob',
    resolve: (profiles) => resolveDirectiveFromProfiles('client.$dob_mm/dd/yyyy', profiles),
  },
  {
    fieldName: 'current date',
    resolve: (profiles) => resolveDirectiveFromProfiles('currentDate', profiles),
  },
];

export function buildOrgAttachmentAutofillAnswers(
  profiles: ResolvedProfiles | null | undefined,
): Record<string, string> {
  const answers: Record<string, string> = {};
  V0_ATTACHMENT_FIELD_MAP.forEach(({ fieldName, resolve }) => {
    const resolvedValue = resolve(profiles);
    if (resolvedValue === undefined || resolvedValue === null) return;
    const textValue = String(resolvedValue).trim();
    if (!textValue) return;
    answers[fieldName] = textValue;
  });
  return answers;
}
