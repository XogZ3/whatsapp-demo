import { InfiniteMovingCards } from './ui/infinite-moving-cards';

const vids = [
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/js83m9va3r/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/xhz3iatmro/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/io6y2zilcl/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/10jci418iw/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/akuk4dvxk1/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/y6g1a0k4i1/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/q070gbjubd/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/9mhe3pyx1q/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/j0mqqarjbd/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/bl57ixlm15/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/bav03auj23/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/8srod6h1up/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/pf5w61swl4/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/ahls301gf4/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/vvcrk2cau5/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/k3w8tvaqec/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/o70o20963m/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/ho9kg77iqz/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/uy1g0oefhx/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/yrabvq2kb4/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/rwizuo5diw/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/96zejzwp9v/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/0pg2b0iskp/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/vpm59k6ess/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/bzn5h0m62r/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/6wad9h9ray/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/1wwhklgjhf/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/y0roi69e02/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/05hntdd5x1/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/in6pba3ozl/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/gfa9gwogvp/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/t65fpjnkc0/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/htnl6aj37i/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/mbnlsc39fk/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/mlxwzr2xza/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/ebv0h2snn2/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/ihw5vwjsur/out.mp4',
  'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/igwuezp1mn/out.mp4',
];

const filteredVids = vids.filter(
  (vid): vid is string => typeof vid === 'string',
);

const cards = filteredVids.slice(0, 9).map((vid) => ({
  id: Math.random(),
  videoSrc: vid,
}));

export function ShortsCarousel() {
  return (
    <div className="ml-0 flex min-w-max flex-col items-center justify-center overflow-hidden rounded-md antialiased sm:ml-10">
      <InfiniteMovingCards
        cards={cards}
        direction="left"
        speed="slow"
        pauseOnHover
      />
    </div>
  );
}
