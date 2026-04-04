import { api } from '../api/axiosInstance';

export const fetchAvailableModels = async () => {
  const res = await api.get('/models');
  return res.data.response || [];
};

export const askAI = async (prompt, modelId, onChunk, token) => {
  const baseURL = api.defaults.baseURL;
  const url = baseURL.startsWith('http') ? baseURL : `${window.location.origin}${baseURL}`;
  
  const response = await fetch(`${url}/ask-ai`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ prompt, modelId }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server responded with ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedData = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    accumulatedData += chunk;

    // OpenRouter sends data: {...} events
    const lines = accumulatedData.split('\n');
    accumulatedData = lines.pop() || ''; // Keep the incomplete line

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
      
      if (trimmedLine.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmedLine.substring(6));
          const delta = json.choices?.[0]?.delta?.content || '';
          if (delta) onChunk(delta);
        } catch (e) {
          // Incomplete fragment or non-json data
        }
      }
    }
  }
};

export const saveResponse = async (prompt, response) => {
  const res = await api.post('/save', { prompt, response });
  return res.data;
};

export const getHistory = async () => {
  const res = await api.get('/history');
  return res.data.response || [];
};
