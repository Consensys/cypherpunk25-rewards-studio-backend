-- Returns participants addresses that have completed the challenge, 
-- but not yet received the associated reward.
-- Will return null in case the challenge has no challenge-level reward.
SELECT DISTINCT cs.address, cs.challenge_id FROM challenge_success cs
LEFT JOIN challenge c ON c.id = cs.challenge_id
LEFT JOIN reward r ON r.challenge_id = c.id
WHERE r.id IS NOT NULL AND cs.challenge_id = $1
AND cs.address NOT IN (
  -- handles case this list in returned as null by forcing a default value
  select coalesce(rd.address::varchar(100), 'None') Address from reward r
  left join reward_distribution rd on rd.reward_id = r.id
  where r.challenge_id = cs.challenge_id
);