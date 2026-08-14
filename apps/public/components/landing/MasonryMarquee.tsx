import React from 'react';
import { 
  Wrench, BookOpen, Code2, Users, Rocket, TrendingUp, MonitorPlay, PenTool,
  PlayCircle, Code, Globe, Paintbrush, Trophy, GraduationCap, Lightbulb, Zap, Server, Shield
} from 'lucide-react';
import './MasonryMarquee.css';

const MqBox = ({ w, bg, title, desc, icon: Icon }: { w: string; bg: string; title: string; desc: string; icon: React.ElementType }) => {
  return (
    <div className={`mq-box ${w} ${bg}`}>
      <div className="mq-icon-corner">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="mq-title">{title}</h3>
      <p className="mq-desc">{desc}</p>
    </div>
  );
};

export default function MasonryMarquee() {
  const row1 = (
    <div className="marquee-group">
      <MqBox w="w-1" bg="bg-dashed" title="BUILD" desc="Turn ideas into reality" icon={Wrench} />
      <MqBox w="w-3" bg="bg-blue" title="LEARN" desc="Master the latest tech stacks and frameworks" icon={BookOpen} />
      <MqBox w="w-2" bg="bg-dark" title="CODE" desc="Write clean, scalable systems" icon={Code2} />
      <MqBox w="w-4" bg="bg-coral" title="COMMUNITY" desc="Connect with thousands of builders globally" icon={Users} />
      <MqBox w="w-1" bg="bg-dashed" title="SHIP" desc="Deploy to production" icon={Rocket} />
      <MqBox w="w-2" bg="bg-emerald" title="GROW" desc="Level up your entire career" icon={TrendingUp} />
      <MqBox w="w-3" bg="bg-dark" title="WORKSHOPS" desc="Hands-on live coding sessions" icon={MonitorPlay} />
      <MqBox w="w-1" bg="bg-violet" title="UI/UX" desc="Design stunning interfaces" icon={PenTool} />
    </div>
  );

  const row2 = (
    <div className="marquee-group">
      <MqBox w="w-2" bg="bg-emerald" title="START" desc="Begin your tech journey" icon={PlayCircle} />
      <MqBox w="w-1" bg="bg-dark" title="DEV" desc="Engineering excellence" icon={Code} />
      <MqBox w="w-4" bg="bg-dashed" title="COLLABORATE" desc="Work seamlessly across disciplines and borders" icon={Globe} />
      <MqBox w="w-2" bg="bg-blue" title="DESIGN" desc="Craft pixels with precision" icon={Paintbrush} />
      <MqBox w="w-1" bg="bg-coral" title="WIN" desc="Crush your career goals" icon={Trophy} />
      <MqBox w="w-3" bg="bg-dark" title="COURSES" desc="Curated paths from top industry experts" icon={GraduationCap} />
      <MqBox w="w-2" bg="bg-dashed" title="CREATE" desc="Build the tools of tomorrow" icon={Lightbulb} />
      <MqBox w="w-1" bg="bg-violet" title="PLAY" desc="Learn through building" icon={Zap} />
    </div>
  );

  const row3 = (
    <div className="marquee-group">
      <MqBox w="w-4" bg="bg-violet" title="LEVEL UP" desc="Transform from beginner to highly sought-after professional" icon={TrendingUp} />
      <MqBox w="w-2" bg="bg-dashed" title="HACK" desc="Solve complex algorithms" icon={Code2} />
      <MqBox w="w-1" bg="bg-coral" title="ART" desc="Digital masterpieces" icon={Paintbrush} />
      <MqBox w="w-3" bg="bg-dark" title="INNOVATE" desc="Push the boundaries of modern tech" icon={Lightbulb} />
      <MqBox w="w-2" bg="bg-blue" title="NETWORK" desc="Meet future co-founders" icon={Users} />
      <MqBox w="w-4" bg="bg-dashed" title="MASTERCLASS" desc="Deep dives into advanced software architecture" icon={Shield} />
      <MqBox w="w-1" bg="bg-emerald" title="PRO" desc="Industry standards" icon={Server} />
      <MqBox w="w-2" bg="bg-dark" title="SYSTEMS" desc="Scale your platforms" icon={Globe} />
    </div>
  );

  return (
    <section className="masonry-marquee-section">
      <div className="marquee-row marquee-left">
        <div className="marquee-content">
          {row1}
          {row1}
        </div>
      </div>
      <div className="marquee-row marquee-right">
        <div className="marquee-content">
          {row2}
          {row2}
        </div>
      </div>
      <div className="marquee-row marquee-left fast">
        <div className="marquee-content">
          {row3}
          {row3}
        </div>
      </div>
    </section>
  );
}
