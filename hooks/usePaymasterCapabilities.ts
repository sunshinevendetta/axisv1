import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useCapabilities } from 'wagmi';

export function usePaymasterCapabilities() {
  const { address, chainId } = useAccount();

  const { data: availableCapabilities } = useCapabilities({
    account: address,
  });

  const capabilities = useMemo(() => {
    if (!availableCapabilities || !chainId) return {};

    const chainCaps = availableCapabilities[chainId];
    if (chainCaps?.paymasterService?.supported) {
      return {
        paymasterService: {
          url: '/api/paymaster',
        },
      };
    }
    return {};
  }, [availableCapabilities, chainId]);

  return { capabilities };
}
