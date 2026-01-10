-- Create withdrawals table to track withdrawal requests
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  credits_amount INTEGER NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawals
CREATE POLICY "Users can view their own withdrawals"
ON public.withdrawals
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create withdrawal requests
CREATE POLICY "Users can create their own withdrawals"
ON public.withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add total_withdrawn column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_withdrawn NUMERIC DEFAULT 0;