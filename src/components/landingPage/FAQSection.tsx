import React from 'react';

const FAQSection: React.FC = () => {
  const faqItems = [
    {
      question: 'What is AI Chat?',
      answer:
        'AI Chat is an advanced conversational platform that uses artificial intelligence to engage in human-like dialogue, answer questions, and assist with various tasks.',
    },
    {
      question: 'How does AI Chat work?',
      answer:
        'AI Chat uses natural language processing and machine learning algorithms to understand user input, generate relevant responses, and continuously improve its performance based on interactions.',
    },
    {
      question: 'Is my data safe with AI Chat?',
      answer:
        'Yes, we take data privacy and security seriously. All conversations are encrypted, and we do not store personal information without explicit consent.',
    },
    {
      question: 'Can AI Chat understand multiple languages?',
      answer:
        'Yes, AI Chat supports multiple languages and can detect and respond in the language used by the user.',
    },
    {
      question: 'Is AI Chat available 24/7?',
      answer:
        'Yes, AI Chat is available round the clock, providing assistance whenever you need it.',
    },
  ];

  return (
    <section className="bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <h2>Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqItems.map((item) => (
          <div key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
