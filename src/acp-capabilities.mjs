// Lesson 0004 source: the Guest List.
// initialize trades capability advertisements; every later request is checked
// against them. Auth methods are advertised; edits always ask (requires_action).
// Shapes mirror ACP v2: capabilities.session.prompt.{image,audio},
// capabilities.session.mcp.{stdio,http}, authMethods[],
// session/new {cwd, mcpServers[]}.

export function advertises(agentCaps, feature) {
  // feature: 'prompt:image' | 'prompt:audio' | 'mcp:stdio' | 'mcp:http'
  const [area, name] = feature.split(':');
  return Boolean(agentCaps?.session?.[area]?.[name]);
}

export function canSendPrompt(agentCaps, blockTypes) {
  // 'text' is always allowed; anything else must be advertised.
  const missing = blockTypes.filter((t) => t !== 'text' && !advertises(agentCaps, `prompt:${t}`));
  return { ok: missing.length === 0, missing };
}

export function canUseMcp(agentCaps, sessionServers, serverType) {
  // Allowed only if the Agent advertises the transport AND this session
  // actually connected a server of that type at session/new.
  if (!advertises(agentCaps, `mcp:${serverType}`)) return false;
  return sessionServers.some((s) => s.type === serverType);
}

export function gate(request) {
  // Reads are free, writes go through the bouncer.
  if (request.kind === 'edit') return 'ask';
  return 'allow';
}

export function requiresAuth(authMethods) {
  return Array.isArray(authMethods) && authMethods.length > 0;
}
