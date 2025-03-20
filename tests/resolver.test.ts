import mDNS from 'multicast-dns';
import { defaultResolver, DevialetGroupResolver } from '../src/api/resolver';


describe('BonjourResolver', () => {
  let resolver: DevialetGroupResolver;
  let mockMdns: mDNS.MulticastDNS;

  beforeEach(() => {
    
    resolver = defaultResolver();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize mDNS and send a query', () => {
    expect(mDNS).toHaveBeenCalled();
    expect(mockMdns.query).toHaveBeenCalledWith({
      questions: [
        { name: 'manufacturer=Devialet', type: 'TXT' },
        { name: 'ipControlVersion=1', type: 'TXT' },
      ],
    });
  });

  it('should emit DevialetGroup on valid mDNS response', (done) => {
    const mockResponse = {
      answers: [
        {
          type: 'TXT',
          data: 'hostname=devialet.local,address=192.168.1.100,port=8080',
        },
      ],
    };

    mockMdns.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'response') {
        callback(mockResponse);
      }
    });

    resolver.stream().subscribe({
      next: (group) => {
        expect(group).toEqual({
          hostname: 'devialet.local',
          address: '192.168.1.100',
          port: 8080,
        });
        done();
      },
      error: (err) => {
        done(err);
      },
    });
  });

  it('should return null for current group initially', () => {
    expect(resolver.current).toBeNull();
  });
});