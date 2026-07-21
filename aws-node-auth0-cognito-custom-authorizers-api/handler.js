// Public API
export const publicEndpoint = async () => ({ message: 'Welcome to our Public API!' });

// Private API
export const privateEndpoint = async () => ({ message: 'Only logged in users can see this' });
