-- Ensure required columns exist in test_results table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='mindset_tipo') THEN
        ALTER TABLE test_results ADD COLUMN mindset_tipo TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='vac_dominante') THEN
        ALTER TABLE test_results ADD COLUMN vac_dominante TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='insights_consultivos') THEN
        ALTER TABLE test_results ADD COLUMN insights_consultivos TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='user_id') THEN
        ALTER TABLE test_results ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;
