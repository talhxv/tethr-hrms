import {
  OnboardingCard,
  OnboardingEditButton,
  OnboardingReviewRow,
} from '../../../components/onboarding/OnboardingFlow';
import type { IntakeReviewGroup } from '../intakeSteps';

type IntakeReviewProps = {
  readonly groups: readonly IntakeReviewGroup[];
  /** Jumps back to the field step that produced the group (index into the
   *  field steps, not the review step). */
  readonly onEditGroup: (groupIndex: number) => void;
};

// The final step: every answer as label/value rows, grouped the way the form
// asked for it, each group carrying an Edit affordance back to its step.
export const IntakeReview = ({ groups, onEditGroup }: IntakeReviewProps) => (
  <>
    {groups.map((group, index) => (
      <OnboardingCard
        action={<OnboardingEditButton onClick={() => onEditGroup(index)} />}
        key={group.key}
        title={group.title}
      >
        <div className="field-list onboarding-review">
          {group.entries.map((entry) => (
            <OnboardingReviewRow key={entry.label} label={entry.label} value={entry.value} />
          ))}
        </div>
      </OnboardingCard>
    ))}
  </>
);
