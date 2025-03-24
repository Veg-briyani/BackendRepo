router.post('/test-email', async (req, res) => {
  await sendWelcomeEmail('test@email.com', 'Test Author');
  res.send('Email sent');
}); 