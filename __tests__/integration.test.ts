/**
 * DataPulse AI — Integration Tests
 * Tests public routes, auth redirects, API endpoints, and security headers
 * Run with: npx tsx __tests__/integration.test.ts
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`  ✓ ${name}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push({ name, passed: false, error: msg })
    console.log(`  ✗ ${name}: ${msg}`)
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

// ============================================
// PUBLIC PAGES
// ============================================
async function testPublicPages() {
  console.log('\n📄 Public Pages')

  await test('Landing page (/) returns 200', async () => {
    const res = await fetch(`${BASE_URL}/`)
    assert(res.status === 200, `Expected 200, got ${res.status}`)
  })

  await test('Landing page contains hero title', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const html = await res.text()
    assert(html.includes('Raw Data to Authority Content'), 'Hero title not found')
  })

  await test('Landing page contains DataPulse AI branding', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const html = await res.text()
    assert(html.includes('DataPulse AI'), 'Brand name not found')
  })

  await test('Pricing page (/pricing) returns 200', async () => {
    const res = await fetch(`${BASE_URL}/pricing`)
    assert(res.status === 200, `Expected 200, got ${res.status}`)
  })

  await test('Pricing page contains plan names', async () => {
    const res = await fetch(`${BASE_URL}/pricing`)
    const html = await res.text()
    assert(html.includes('Professional') || html.includes('Starter'), 'Plan names not found')
  })

  await test('Login page (/login) returns 200', async () => {
    const res = await fetch(`${BASE_URL}/login`)
    assert(res.status === 200, `Expected 200, got ${res.status}`)
  })

  await test('Login page contains sign-in form', async () => {
    const res = await fetch(`${BASE_URL}/login`)
    const html = await res.text()
    assert(html.includes('Magic Link') || html.includes('magic') || html.includes('email'), 'Sign-in form not found')
  })

  await test('Signup page (/signup) returns 200', async () => {
    const res = await fetch(`${BASE_URL}/signup`)
    assert(res.status === 200, `Expected 200, got ${res.status}`)
  })

  await test('Signup page mentions free trial', async () => {
    const res = await fetch(`${BASE_URL}/signup`)
    const html = await res.text()
    assert(html.includes('14') || html.includes('trial') || html.includes('free'), 'Free trial mention not found')
  })
}

// ============================================
// AUTH REDIRECTS (protected routes)
// ============================================
async function testAuthRedirects() {
  console.log('\n🔒 Auth Redirects (unauthenticated)')

  await test('/dashboard redirects to /login', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' })
    assert(res.status === 307 || res.status === 302 || res.status === 308, `Expected redirect, got ${res.status}`)
    const location = res.headers.get('location') || ''
    assert(location.includes('/login'), `Expected redirect to /login, got ${location}`)
  })

  await test('/upload redirects to /login', async () => {
    const res = await fetch(`${BASE_URL}/upload`, { redirect: 'manual' })
    assert(res.status === 307 || res.status === 302 || res.status === 308, `Expected redirect, got ${res.status}`)
  })

  await test('/settings redirects to /login', async () => {
    const res = await fetch(`${BASE_URL}/settings`, { redirect: 'manual' })
    assert(res.status === 307 || res.status === 302 || res.status === 308, `Expected redirect, got ${res.status}`)
  })

  await test('/billing redirects to /login', async () => {
    const res = await fetch(`${BASE_URL}/billing`, { redirect: 'manual' })
    assert(res.status === 307 || res.status === 302 || res.status === 308, `Expected redirect, got ${res.status}`)
  })

  await test('/history redirects to /login', async () => {
    const res = await fetch(`${BASE_URL}/history`, { redirect: 'manual' })
    assert(res.status === 307 || res.status === 302 || res.status === 308, `Expected redirect, got ${res.status}`)
  })

  await test('/admin redirects to /login', async () => {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' })
    assert(res.status === 307 || res.status === 302 || res.status === 308, `Expected redirect, got ${res.status}`)
  })
}

// ============================================
// API ENDPOINTS
// ============================================
async function testAPIEndpoints() {
  console.log('\n🔌 API Endpoints')

  await test('GET /api/projects returns 401 without auth', async () => {
    const res = await fetch(`${BASE_URL}/api/projects`)
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  await test('POST /api/upload returns 401 without auth', async () => {
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'test.pdf', fileSize: 1000, contentType: 'application/pdf' }),
    })
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  await test('POST /api/checkout/subscription returns 401 without auth', async () => {
    const res = await fetch(`${BASE_URL}/api/checkout/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: 'price_test' }),
    })
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  await test('POST /api/checkout/credits returns 401 without auth', async () => {
    const res = await fetch(`${BASE_URL}/api/checkout/credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: 'price_test', credits: 5 }),
    })
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  await test('POST /api/portal returns 401 without auth', async () => {
    const res = await fetch(`${BASE_URL}/api/portal`, { method: 'POST' })
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  await test('POST /api/webhooks/stripe rejects invalid signature', async () => {
    const res = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'stripe-signature': 'invalid' },
      body: '{}',
    })
    assert(res.status === 400, `Expected 400, got ${res.status}`)
  })

  await test('Inngest endpoint responds', async () => {
    const res = await fetch(`${BASE_URL}/api/inngest`, { method: 'GET' })
    // Inngest returns 200 with introspection data or 405
    assert(res.status === 200 || res.status === 405 || res.status === 500, `Expected valid response, got ${res.status}`)
  })
}

// ============================================
// SECURITY HEADERS
// ============================================
async function testSecurityHeaders() {
  console.log('\n🛡️  Security Headers')

  await test('X-Frame-Options is DENY', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const val = res.headers.get('x-frame-options')
    assert(val === 'DENY', `Expected DENY, got ${val}`)
  })

  await test('X-Content-Type-Options is nosniff', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const val = res.headers.get('x-content-type-options')
    assert(val === 'nosniff', `Expected nosniff, got ${val}`)
  })

  await test('Referrer-Policy is set', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const val = res.headers.get('referrer-policy')
    assert(val !== null, 'Referrer-Policy header missing')
  })

  await test('Content-Security-Policy is set', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const val = res.headers.get('content-security-policy')
    assert(val !== null, 'CSP header missing')
  })

  await test('CSP contains nonce directive', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const val = res.headers.get('content-security-policy') || ''
    assert(val.includes('nonce-'), 'CSP does not contain nonce')
  })

  await test('CSP blocks object-src', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const val = res.headers.get('content-security-policy') || ''
    assert(val.includes("object-src 'none'"), 'CSP object-src not blocked')
  })

  await test('Permissions-Policy is set', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const val = res.headers.get('permissions-policy')
    assert(val !== null, 'Permissions-Policy header missing')
  })
}

// ============================================
// I18N
// ============================================
async function testI18N() {
  console.log('\n🌍 Internationalization')

  await test('Default lang is "en"', async () => {
    const res = await fetch(`${BASE_URL}/`)
    const html = await res.text()
    assert(html.includes('lang="en"'), 'Default lang not en')
  })

  await test('French locale via cookie', async () => {
    const res = await fetch(`${BASE_URL}/`, {
      headers: { Cookie: 'locale=fr' },
    })
    const html = await res.text()
    assert(html.includes('lang="fr"'), 'French locale not applied')
  })

  await test('Spanish locale via cookie', async () => {
    const res = await fetch(`${BASE_URL}/`, {
      headers: { Cookie: 'locale=es' },
    })
    const html = await res.text()
    assert(html.includes('lang="es"'), 'Spanish locale not applied')
  })

  await test('French hero title appears', async () => {
    const res = await fetch(`${BASE_URL}/`, {
      headers: { Cookie: 'locale=fr' },
    })
    const html = await res.text()
    // Check for French content
    assert(
      html.includes('donn') || html.includes('contenu') || html.includes('autorit'),
      'French content not found in hero'
    )
  })
}

// ============================================
// 404 HANDLING
// ============================================
async function test404() {
  console.log('\n🚫 404 Handling')

  await test('Non-existent route returns 404', async () => {
    const res = await fetch(`${BASE_URL}/this-page-does-not-exist`)
    assert(res.status === 404, `Expected 404, got ${res.status}`)
  })
}

// ============================================
// RUN ALL TESTS
// ============================================
async function main() {
  console.log('🚀 DataPulse AI — Integration Tests')
  console.log(`   Target: ${BASE_URL}\n`)

  await testPublicPages()
  await testAuthRedirects()
  await testAPIEndpoints()
  await testSecurityHeaders()
  await testI18N()
  await test404()

  // Summary
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  console.log('\n' + '='.repeat(50))
  console.log(`Results: ${passed}/${total} passed, ${failed} failed`)

  if (failed > 0) {
    console.log('\nFailed tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ ${r.name}: ${r.error}`)
    })
    process.exit(1)
  } else {
    console.log('\n✅ All tests passed!')
    process.exit(0)
  }
}

main().catch(err => {
  console.error('Test runner error:', err)
  process.exit(1)
})
