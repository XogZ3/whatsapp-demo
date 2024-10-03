import { Container, Section } from '@/components/GeneralContainers';

import WhatsAppMessagesUI from './wamsg';

export default function ChatsPage() {
  return (
    <Section>
      <Container noYPadding>
        <WhatsAppMessagesUI />
      </Container>
    </Section>
  );
}
