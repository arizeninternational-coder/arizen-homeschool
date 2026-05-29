-- Run this in Supabase SQL Editor to remove existing parent-child links
DELETE FROM "ParentChild" WHERE "childUserId" IN (
  SELECT "id" FROM "User" WHERE "email" = 'ariyanaseneca@gmail.com'
);
-- Also check what links exist
SELECT pc."id", pc."parentId", pc."childUserId", u.email as child_email, p.email as parent_email
FROM "ParentChild" pc
JOIN "User" u ON u."id" = pc."childUserId"
JOIN "User" p ON p."id" = pc."parentId";
