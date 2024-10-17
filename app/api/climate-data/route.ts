import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const plz = searchParams.get('plz');

  if (!plz) {
    return NextResponse.json({ error: 'PLZ is required' }, { status: 400 });
  }

  const url = `https://www.waermepumpe.de/normen-technik/klimakarte/?tx_bwpclimatezones_map%5Baction%5D=additionalData&tx_bwpclimatezones_map%5Bcontroller%5D=Map&tx_bwpclimatezones_map%5Bzip%5D=${plz}&type=7289322&cHash=b35b0178fb0af149ec740ad13e8f1534`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
        'Accept': '*/*',
        'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching climate data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch climate data' },
      { status: 500 },
    );
  }
}
