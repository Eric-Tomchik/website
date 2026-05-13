# Newsletter API

> Handles email newsletter subscription and unsubscription.

---

## Subscribe — `POST /api/newsletter`

### Request
```json
{
  "email": "user@example.com"
}
```

### Flow
1. Lowercase and trim email
2. Check for existing subscriber in `newsletter_subscribers`
3. If exists and active → return `alreadySubscribed: true`
4. If exists and inactive → reactivate (set `is_active: true`)
5. If new → insert new subscriber record
6. Enroll in active drip sequences
7. Return success

## Unsubscribe — `POST /api/newsletter/unsubscribe`

### Flow
1. Find subscriber by email
2. Set `is_active: false` (soft delete — preserves history)
3. Pause active drip enrollments

## Unsubscribe Page — `/unsubscribe`
- Web page with email input
- Calls unsubscribe API
- Confirmation message on success

---

## Related
- [[Marketing Tables]]
- [[Admin — Content]]
