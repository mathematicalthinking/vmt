import React from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import classes from './terms.css';
import { Aux } from '../../Components';

const Terms = () => {
  return (
    <Aux>
      <div
        className={classes.BackgroundContainer}
        style={{ height: document.body.scrollHeight }}
      >
        <div className={classes.Background} />
      </div>
      <div className={classes.Container}>
        <div>
          <h1 id="top" className={classes.Tagline}>
            VMT: Terms of Service and Privacy Policy
          </h1>
          <div className={classes.Banner}>
            <Link to="/terms#terms" className={classes.Links}>
              Terms of Service
            </Link>
            <Link to="/terms#privacy" className={classes.Links}>
              Privacy Policy
            </Link>
          </div>
        </div>

        <h2 id="terms" className={classes.Tagline}>
          Terms of Service
        </h2>
        <p className={classes.DetailDescription}>
          Thank you for your interest in using the online services operated by
          the 21st Century Partnership for STEM Education.
          (&quot;21PSTEM&quot;). These Terms of Service (&quot;Terms&quot;)
          govern your use of 21PSTEM’s online services (collectively, the
          &quot;Services&quot;), including the services which are offered
          through (i) our website located at www.21PSTEM.org and
          www.MathematicalThinking.org and (ii) third party providers.{' '}
        </p>
        <div className={classes.Content}>
          <h3>1. Our Services</h3>
          <p className={classes.Description}>
            By using the 21PSTEM Services, you agree to be bound by these Terms
            and to the collection and use of your information as described in
            our Privacy Policy. 21PSTEM Services include, but are not limited
            to: Virtual Math Teams, EnCoMPASS, MathematicalThinking.org,
            Curriculum App, and PARLO Tracker. If you do not agree to these
            Terms, you are not permitted to use the 21PSTEM Services.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>2. Eligibility and Authority</h3>
          <p className={classes.Description}>
            If you are agreeing to these Terms on behalf of a school, school
            district, or other educational institution (collectively, a
            “School”) for the purpose of providing the 21PSTEM Services to
            students (“Students”), you represent and warrant that you are an
            authorized representative of the School and you agree to these Terms
            on the School’s behalf. Otherwise, you are agreeing to these Terms
            on behalf of yourself. The U.S. Children’s Online Privacy and
            Protection Act (“COPPA”) requires that online service providers
            obtain verifiable parental consent before collecting personal
            information from children under 13. If you are a School providing
            the Service to children under 13 (whether in the U.S. or elsewhere),
            you represent and warrant that you have received consent from
            Parents, or have the authority to provide consent on behalf of
            parents, for us to collect information from students before allowing
            children under 13 to access 21PSTEM Services. We recommend that all
            Schools provide appropriate disclosures to students and parents
            regarding their use of service providers such as 21PSTEM.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>3. Personal Information and Student Data</h3>
          <p className={classes.Description}>
            When 21PSTEM is used by a School for an educational purpose, 21PSTEM
            may collect or have access to Student Data that is provided by the
            School or by the Student. “Student Data” is personal information
            that is directly related to an identifiable Student and may include
            “educational records” as defined by the Family Educational Rights
            and Privacy Act (“FERPA”), 20 U.S.C. § 1232(g). Confidentiality.
            21PSTEM agrees to treat Student Data as confidential and not to
            share it with third parties other than as described in these Terms,
            and in our Privacy Policy. Student Data Access. You authorize
            21PSTEM to access or collect Student Data for the purpose of
            providing the Service. In the U.S., 21PSTEM shall collect and
            process Student Data as a School Official with a legitimate
            educational interest pursuant to FERPA 34 CFR Part 99.31(a)(1). As
            between the parties, the School or the Student owns and controls the
            Student Data. 21PSTEM does not own or control, or license such
            Student Data, except as to provide the Service and as described in
            these Terms. Personal Information and Student Data Consents and
            Authority. If you are School User, you represent and warrant that
            you have provided appropriate disclosures to your School and to
            parents regarding your sharing such Personal Information with
            21PSTEM. Both Parties agree to uphold their obligations under the
            Family Educational Rights and Privacy Act (“FERPA”), the Protection
            of Pupil Rights Amendment (&quot;PPRA&quot;), and the Children’s
            Online Privacy and Protection Act (“COPPA”) and applicable State
            laws relating to student data privacy. 21PSTEM relies on each School
            to obtain and provide appropriate consent and disclosures, if
            necessary, for 21PSTEM to collect any Student Data, including the
            collection of Student Data directly from students under 13, as
            permitted under COPPA. You agree to comply with these Terms and all
            laws and regulations governing the protection of personal
            information, including children’s information, and the sharing of
            student education records. Use of Student Data. By submitting or
            providing us access to Student Data, you agree that 21PSTEM may use
            the Student Data solely for the purposes of (i) providing the
            Service, (ii) improving and developing our Service, (iii) enforcing
            our rights under these Terms, and (iv) as permitted with the
            School’s or the User’s consent. 21PSTEM shall not use Student Data
            to engage in targeted advertising. Any data collected for research
            purposes will be overseen by an Institutional Review Board (“IRB”)
            and the collection of your data for approved research purposes will
            be done as required by an IRB, often including User consent (and
            assent from Minors with consent from a guardian). Use of Anonymized
            Student Data. You agree that we may collect and use data derived
            from Student Data for our own purposes, such as for product
            development, research analytics, and marketing our Service, provided
            that such data will be de-identified and/or aggregated to reasonably
            avoid identification of a specific individual. Third-Party Service
            Providers. You acknowledge and agree that 21PSTEM may provide access
            to Student Data to our employees and service providers, which have a
            legitimate need to access such information in order to provide their
            services to us. We and our employees, affiliates, service providers,
            or agents involved in the handling, transmittal, and processing of
            Student Data will be required to maintain the confidentiality of
            such data. Student Data Retention and Deletion Requests. Schools may
            request that we delete Student Data in our possession at any time by
            providing such a request in writing, except that 21PSTEM shall not
            be required to delete content a Student shared to public areas of
            the Service. We shall respond to the deletion request as soon as
            possible, but in most instances within 45 days, other than for data
            stored on backup tapes which shall be deleted in the ordinary course
            of business. A Parent seeking to modify, correct, or delete personal
            information in a Student Account that is connected to an active
            School account will be instructed to contact the School to discuss
            data deletion or modification. We are not required to delete data
            that has been derived from Student Data so long as it has been
            anonymized such that it does not reasonably identify an individual.
            Data Breach Notification. We have implemented administrative,
            physical and technical safeguards designed to secure Personal
            Information, including Student Data, from unauthorized access,
            disclosure and use. In the event we have a reasonable, good faith
            belief that an unauthorized party has gained access to or been
            disclosed Student Data (a “Security Event”), that we have collected
            or received through the Service, we will promptly notify the School.
            If, due to a Security Event which is caused by the acts or omissions
            of 21PSTEM or its agents, a notification to an individual,
            organization or government agency is required under applicable
            privacy laws, the School shall be responsible for the timing,
            content, and method of any such legally-required notice and
            compliance with such laws and 21PSTEM shall indemnify the School for
            costs related to legally-required notifications. With respect to any
            Security Event which is not caused by the acts or omissions of
            21PSTEM or its agents, 21PSTEM shall reasonably cooperate with
            School’s investigation of the Security Event, as School requests, at
            School’s reasonable expense. 21PSTEM shall be responsible for the
            timing, content, cost and method of notice and compliance with such
            laws as they relate to User accounts that are not associated with a
            School account.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>4. Your Responsibilities</h3>
          <p className={classes.Description}>
            You agree:{<br />} a. that you are responsible for obtaining and
            maintaining all equipment and services needed for access to and use
            of the 21PSTEM Services and for paying all charges related thereto;
            and
            {<br />} b. not to use the 21PSTEM Services to: i. violate any third
            party rights or any local, state, national, or international law or
            regulation; ii. transmit or create any materials that are abusive,
            harassing, tortious, defamatory, libelous, or invasive of
            another&#39;s privacy; iii. transmit any material that contains
            adware, malware, spyware, software viruses, or any other computer
            code, files, or programs designed to interrupt, destroy, or limit
            the functionality of any computer software or hardware or
            telecommunications equipment; iv. impersonate any person or entity,
            or otherwise misrepresent your affiliation with a person or entity;
            or v. interfere with or disrupt the 21PSTEM Services or servers or
            networks connected to the 21PSTEM Services, or disobey any
            requirements, procedures, policies, or regulations of networks
            connected to the 21PSTEM Services.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>5. Personal, Non-Commercial Use Only</h3>
          <p className={classes.Description}>
            You agree to use the 21PSTEM Services only (a) as an end user, for
            your personal, non-commercial use or (b) as a teacher, for academic
            use by you and your students in individual classes. 21PSTEM does,
            pursuant to a separate written agreement, permit certain third
            parties (y) to integrate with the 21PSTEM Services for commercial
          </p>
        </div>
        <div className={classes.Content}>
          <h3>6. User Submissions and Generated Materials</h3>
          <p className={classes.Description}>
            21PSTEM does not claim ownership of any materials you submit and
            create for display or distribution to others through the 21PSTEM
            Services (“User Submissions and Generated Materials”). As between
            21PSTEM and you, you own all rights to your User Submissions and
            Generated Materials. You grant to 21PSTEM an irrevocable, perpetual,
            non-exclusive, fully-paid, worldwide license, with the right to
            sublicense through multiple tiers, to use, distribute, reproduce,
            modify, adapt, publish, translate, publicly perform, and publicly
            display or otherwise use your User Submissions and Generated
            Materials (in whole or in part) in connection with the operation of
            the Service or the promotion, advertising or marketing thereof, in
            any format or medium now known or later developed, without
            compensation or notification to or permission from the user of any
            kind. You acknowledge and agree that all right and title in the
            software code and other material used to create or display your User
            Submissions and Generated Materials is the property of 21PSTEM, and
            you hereby assign all right and title in such material to 21PSTEM.
            21PSTEM hereby grants you a license to such material (a) as an end
            user, for your personal, non-commercial use or (b) as a teacher, for
            academic use by you and your students in individual classes. 21PSTEM
            does not pre-screen User Submissions and Generated Materials and you
            agree that you are solely responsible for all of your User
            Submissions and Generated Materials. 21PSTEM is not required to
            host, display, or distribute any User Submissions and Generated
            Materials, and may remove at any time or refuse any User Submissions
            and Generated Materials. 21PSTEM is not responsible for any loss,
            theft or damage of any kind to any User Submissions and Generated
            Materials. You represent and warrant that your User Submissions and
            Generated Materials, and 21PSTEM’s authorized use thereof, do not
            and will not infringe the rights of any third party (including,
            without limitation, intellectual property rights, rights of privacy
            or publicity, or any other legal or moral rights).
          </p>
        </div>
        <div className={classes.Content}>
          <h3>7. Activity Sharing</h3>
          <p className={classes.Description}>
            At the time you submit to 21PSTEM an activity you’ve developed using
            the 21PSTEM Services (an “Activity”), you may elect to make your
            Activity public. If you do so, then you expressly authorize 21PSTEM
            to (i) make your Activity available to other School users for use in
            individual classes with other students, (ii) allow other School
            users to copy and modify your Activity and use the modified version
            in individual classes with other students and (iii) modify your
            Activity and make the modified version available to other School
            users for use in individual classes with other students. In the case
            of any such use of your Activity (whether unmodified or modified),
            you will receive an attribution credit. If you elect to make your
            Activity public, in no event will 21PSTEM authorize any third party
            to sell your Activity to others, nor will 21PSTEM sell your activity
            itself, without your permission.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>8. Copyright Infringement</h3>
          <p className={classes.Description}>
            21PSTEM has a policy of removing User Submissions and Generated
            Materials that violate copyright law, and, in appropriate
            circumstances, suspending access to the 21PSTEM Services (or any
            portion thereof) to any user who uses the 21PSTEM Services in
            violation of copyright law, and/or terminating the account of any
            user who uses the 21PSTEM Services in violation of copyright law. If
            you believe your copyright is being infringed by a user of the
            21PSTEM Services, please provide written notice of claims of
            copyright infringement.
            <a href="mailto:support@21pstem.org">support@21pstem.org</a>
            610-825-5644
          </p>
        </div>
        <div className={classes.Content}>
          <h3>9. Feedback</h3>
          <p className={classes.Description}>
            If you choose to provide technical, business or other feedback to
            21PSTEM concerning the 21PSTEM Services, 21PSTEM will be free to use
            such feedback without restriction. You understand and agree that the
            incorporation by 21PSTEM of your feedback into any of its products
            or services does not grant you any proprietary rights therein.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>10. Termination and Suspension</h3>
          <p className={classes.Description}>
            Without limiting other remedies, 21PSTEM may terminate or suspend
            your 21PSTEM Services account without notice if 21PSTEM believes
            that you have violated these Terms or have engaged in conduct that
            violates applicable law or is otherwise harmful to the interests of
            21PSTEM, any other 21PSTEM Services user, or any third party. You
            may discontinue your use of the 21PSTEM Services at any time.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>11. Password and Security</h3>
          <p className={classes.Description}>
            You are responsible for maintaining the confidentiality of your
            21PSTEM Services password, and you are solely responsible for all
            activities that occur under your password. You agree to immediately
            notify 21PSTEM of any unauthorized use of your password or any other
            breach of security related to the 21PSTEM Services. 21PSTEM may
            require you to alter your password if 21PSTEM believes that your
            password is no longer secure.{' '}
          </p>
        </div>
        <div className={classes.Content}>
          <h3>12. Third Party Services</h3>
          <p className={classes.Description}>
            21PSTEM may integrate with or provide links to certain third-party
            services (collectively, such third parties, “Linked Partners”). The
            Linked Partner services made available through the 21PSTEM Services
            or the integration of the such sites and services with the 21PSTEM
            Services are for your convenience only and do not signify the
            endorsement by 21PSTEM of such Partner sites or services.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>13. Disclaimer and Limitations of Liability</h3>
          <p className={classes.Description}>
            {<br />} a. You agree that use of the 21PSTEM Services is at your
            sole risk. The 21PSTEM Services are provided on an “as is” and “as
            available” basis. 21PSTEM expressly disclaims all warranties of any
            kind, whether express or implied, with respect to the 21PSTEM
            Services and all services provided by any of our partner (whether
            API partners, linked partners, or otherwise), including, but not
            limited to, the implied warranties of merchantability, fitness for a
            particular use or purpose, and non-infringement. You acknowledge
            that access to data and materials (including, but not limited to,
            your or others’ user submissions and generated materials) available
            through the 21PSTEM Services is not guaranteed and that 21PSTEM will
            not be responsible to you for any loss of data or materials caused
            by the 21PSTEM Services or their unavailability. You understand and
            agree that any data, materials, services and/or information
            downloaded or otherwise obtained through the use of the 21PSTEM
            Services is done at your own discretion and risk and that you will
            be solely responsible for any damage arising therefrom.{<br />} b.
            Under no circumstances will 21PSTEM or its officers, employees,
            directors, shareholders, agents, or licensors be liable under any
            theory of liability (whether in contract, tort, statutory, or
            otherwise) for any damages whatsoever, including direct, indirect,
            incidental, special, consequential or exemplary damages, including
            but not limited to, damages for loss of money, revenues, profits,
            goodwill, use, data or other intangible losses (even if such parties
            were advised of, knew of or should have known of the possibility of
            such damages), resulting from your (or anyone using your
            account&#39;s) use of the 21PSTEM Services.{<br />} c. If,
            notwithstanding these Terms, 21PSTEM is found to be liable to you or
            any third party in connection with your use of the 21PSTEM Services,
            the total liability of 21PSTEM and its officers, employees,
            directors, shareholders, agents, or licensors to you or to any third
            party is limited to one hundred U.S. Dollars ($100).{<br />} d.
            Exclusions and Limitations. Some jurisdictions do not allow the
            exclusion of certain warranties or the limitation or exclusion of
            liability for certain damages. Accordingly, some of the above
            limitations and disclaimers may not apply to you. To the extent that
            21PSTEM may not, as a matter of applicable law, disclaim any implied
            warranty or limit its liabilities, the scope and duration of such
            warranty and the extent of 21PSTEM’ liability will be the minimum
            permitted under such applicable law.{' '}
          </p>
        </div>
        <div className={classes.Content}>
          <h3>14. Indemnification</h3>
          <p className={classes.Description}>
            You agree to indemnify, defend, and hold harmless 21PSTEM and its
            officers, directors, employees, consultants and agents from and
            against any and all claims, liabilities, damages, losses, costs,
            expenses, fees (including reasonable attorneys&#39; fees) that such
            parties may incur as a result of or arising from your (or anyone
            using your account&#39;s) violation of these Terms. 21PSTEM reserves
            the right, at its own expense, to assume the exclusive defense and
            control of any matter otherwise subject to indemnification by you,
            and in such case, you agree to cooperate with 21PSTEM’ defense of
            such claim.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>15. Intellectual Property</h3>
          <p className={classes.Description}>
            “21PSTEM” and certain other of the names, logos, and materials
            displayed in the 21PSTEM Services, may constitute trademarks, trade
            names, or service marks (“Marks”) of 21PSTEM or other entities. You
            are not authorized to use any such Marks. Ownership of all such
            Marks and the goodwill associated therewith remains with 21PSTEM or
            those other entities. The content on the 21PSTEM Services (the
            “Content”), including without limitation, the software, graphs, text
            and graphics, is protected under United States and international
            copyright laws, is subject to other intellectual property and
            proprietary rights and laws, and is owned by 21PSTEM or its
            licensors. Other than with respect to your own User Submissions and
            Generated Materials, (a) the Content may not be copied, modified,
            reproduced, republished, posted, transmitted, sold, offered for
            sale, or redistributed in any way without the prior written
            permission of 21PSTEM and its applicable licensors; and (b) you must
            abide by all copyright notices, information, or restrictions
            contained in or attached to any Content.{' '}
          </p>
        </div>
        <div className={classes.Content}>
          <h3>16. Miscellaneous</h3>
          <p className={classes.Description}>
            Entire Agreement. These Terms and our Privacy Policy, together with
            any additional terms to which you agree when using particular
            elements of the 21PSTEM Services (e.g., terms relating to the
            payment of fees for certain 21PSTEM Services), constitute the entire
            and exclusive and final statement of the agreement between you and
            21PSTEM with respect to the subject matter hereof, and govern your
            use of the 21PSTEM Services, superseding any prior agreements or
            negotiations between you and 21PSTEM with respect to the subject
            matter hereof. Governing Law. These Terms and the relationship
            between you and 21PSTEM will be governed by the laws of the
            Commonwealth of Pennsylvania. All lawsuits arising from or relating
            to these Terms or your use of the 21PSTEM Services will be brought
            in the Federal or State courts located in Pennsylvania and you
            hereby irrevocably submit to the exclusive personal jurisdiction of
            such courts for such purpose. Additional Terms. The failure of
            21PSTEM to exercise or enforce any right or provision of these Terms
            will not constitute a waiver of such right or provision. If any
            provision of these Terms is found by a court of competent
            jurisdiction to be invalid, you nevertheless agree that the court
            should endeavor to give effect to the intentions of 21PSTEM and you
            as reflected in the provision, and that the other provisions of
            these Terms remain in full force and effect. You agree that
            regardless of any statute or law to the contrary, any claim or cause
            of action arising out of or related to use of the 21PSTEM Services
            or these Terms must be filed within one (1) year after such claim or
            cause of action arose or be forever barred. The section titles in
            these Terms are for convenience only and have no legal or
            contractual effect. These Terms will remain in full force and effect
            notwithstanding any termination of your use of the 21PSTEM Services.
            If access to the 21PSTEM Services is licensed to the United States
            government or any agency thereof, then the 21PSTEM Services will be
            deemed to be “commercial computer software” and “commercial computer
            software documentation,” pursuant to DFARS Section 227.7202 and FAR
            Section 12.212, respectively, as applicable. Any use, reproduction,
            release, performance, display, or disclosure of the 21PSTEM Services
            and any accompanying documentation by the U.S. Government will be
            governed solely by these Terms and is prohibited except to the
            extent expressly permitted by these Terms.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>17. Modifications to Terms and Services</h3>
          <p className={classes.Description}>
            a. Modifications. These Terms may be revised periodically and this
            will be reflected in the “date last modified” set forth below. Your
            continued use of the 21PSTEM Services following such update
            constitutes your agreement to the revised Terms. If you object to
            any such changes, your sole recourse will be to cease using the
            21PSTEM Services. Continued use of the 21PSTEM Services following
            notice of any such changes will indicate your acknowledgement of
            such changes and agreement to be bound by the terms and conditions
            of such changes. 21PSTEM reserves the right to modify or discontinue
            the 21PSTEM Services with or without notice to you. {<br />}b. Date
            Last Modified. These Terms were last modified on September 22, 2021.
          </p>
        </div>
        <br />
        <h2 id="privacy" className={classes.Tagline}>
          Privacy Policy
        </h2>
        <p className={classes.DetailDescription}>
          21PSTEM, Inc. (&quot;we&quot; or &quot;21PSTEM&quot;) is committed to
          protecting your privacy. This Privacy Policy describes our collection
          and use of personal information collected from visitors to our website
          and our mobile application(s) (collectively, our &quot;Service&quot;).
          &quot;You&quot; or &quot;your&quot; means a visitor or a user (whether
          logged in or not) of our Service. A note about Student Data: Our
          21PSTEM Service may be used by schools, school districts, or teachers
          (collectively referred to as &quot;Schools&quot;) in a classroom
          setting. When 21PSTEM contracts with a School to provide the Service
          to students (&quot;Students&quot;), we may have access to Student Data
          (defined below). This Privacy Policy is incorporated into and is
          subject to our Terms of Service, which governs your use of the 21PSTEM
          Services.{' '}
        </p>
        <div className={classes.Content}>
          <h3>1. Information Collected</h3>
          <p className={classes.Description}>
            a. Personal Data. You can use the Service without registering for an
            account or providing any other personal data. If you create an
            account on the 21PSTEM Services, or communicate with 21PSTEM, you
            may provide to 21PSTEM certain information by which someone could
            personally identify you, such as your name, email or unique username
            (“Personally Identifiable Information”). We also collect information
            when you save or post content to the Service (“User Content”) and
            communicate with us. We refer to all of this data collectively as
            “Personal Data”. We may also collect Personal Data about you from a
            third party service. For example, if you login to your 21PSTEM
            account through an authentication tool, or if you interact with
            21PSTEM on social media, we may collect the Personal Data you
            authorize that third party service to share.{<br />} b. Usage Data.
            We automatically collect certain technical usage information when
            you use the 21PSTEM Services (“Usage Data”). Usage Data includes the
            information that your web browser or mobile application
            automatically sends to our servers whenever you visit. The Usage
            Data collected in our logs may include information such as your web
            request, Internet Protocol address, operating system, browser type,
            browser language, referring / exit pages and URLs, platform type,
            click history, domain names, landing pages, pages viewed and the
            order of those pages, the amount of time spent on particular pages,
            the date and time of your request, and whether you opened an email.
            Typically, this information is collected through log files, web
            beacons, browser cookies, or other device identifiers that may
            uniquely identify your browser or device. You may be able to set
            your web browser to refuse all cookies, and your mobile device to
            not provide your mobile device identifier. In addition, the 21PSTEM
            Services may use third party analytics and bug tracking software
            (including, without limitation, Google Analytics and Bugsnag) to
            collect further Usage Data regarding the online usage patterns of
            our users and bugs in our Services. We may combine Usage Data with
            Personal Data in a manner that enables us to trace Usage Data to an
            individual user. Although we do our best to honor the privacy
            preferences of our visitors, we are not able to respond to Do Not
            Track signals from your browser at this time. We do not permit third
            party advertising networks or other third parties to collect
            information about your browsing behavior from our website for
            advertising purposes.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>2. Use of Your Information</h3>
          <p className={classes.Description}>
            a. Use. We use your Personal Data and Usage Data (together, “User
            Information”) to operate, maintain, and provide to you the features
            and functionality of the 21PSTEM Services and for related business
            purposes. We may use your User Information to (a) improve the
            quality and design of the 21PSTEM Services and to create new
            features and services by storing, tracking, and analyzing user
            preferences; (b) remember information so that you will not have to
            re-enter it during your visit or the next time you use the 21PSTEM
            Services; (c) provide custom, personalized content and information;
            (d) monitor aggregate metrics such as total number of visitors,
            pages viewed, etc.; and (e) diagnose and fix technology problems and
            otherwise plan for and enhance our Service. 21PSTEM may provide
            personalized content and information to our users, including
            teachers, school administration officials, and other users
            associated with Schools. However, 21PSTEM shall never use Student
            Data to engage in targeted advertising, nor shall 21PSTEM direct
            advertising to student users, nor shall 21PSTEM ever use any
            third-party advertising network on any 21PSTEM Service. As described
            in the Terms of Service, any data collected for research purposes
            will be overseen by an and the collection of your data for approved
            research purposes will be done as required by an IRB.{<br />} b.
            Communications Preferences. We will not use your email address or
            other Personally Identifiable Information to send you marketing
            messages unless you provide your consent, or as part of a specific
            program or feature for which you will have the ability to opt-out.
            You can always opt-out of receiving promotional email from us by
            clicking on the “unsubscribe” feature at the bottom of each email or
            by adjusting your email subscription preferences in your settings.
            We may, however, use your email address without further consent for
            non-marketing or administrative purposes, such as notifying you of
            important 21PSTEM Services changes or for customer service purposes.
            {<br />} c. Retention of Data. Personal and Usage data is retained
            indefinitely by 21PSTEM. If you would like your personal information
            removed, or if you want to remove your name or comments from our
            website or publicly displayed content, you can contact us directly
            at support@21pstem.org. We may not be able to modify or delete your
            information in all circumstances.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>3. Disclosure of Your Information</h3>
          <p className={classes.Description}>
            a. Your Publication. You may, by using applicable sections of the
            21PSTEM Services, share your User Information, including Personally
            Identifiable Information and other content that you create or post
            to others accessing the 21PSTEM Services.{<br />} b. Service
            Providers. We share User Information with our trusted third party
            service providers and other individuals who perform services on our
            behalf, for example, providing customer service support, hosting
            services, analytics and other services we utilize to help us provide
            our Service or conduct our business. These service providers access
            and use User Information only to provide services to 21PSTEM under
            reasonable confidentiality terms.{<br />} c. Other Required Sharing.
            We may share User Information: (i) if required to do so by law, or
            in the good-faith belief that such action is in compliance with
            state and federal laws (including, without limitation, copyright
            laws) or in response to a court order, subpoena, legal process or
            search warrant, or (ii) if we believe, in good faith, such action is
            appropriate or necessary to enforce our Terms of Service, to
            exercise our legal rights, to take precautions against liability, to
            investigate and defend ourselves against any claims or allegations,
            to assist government enforcement agencies, to protect the security
            or integrity of the 21PSTEM Services, and to protect the rights,
            property, or personal safety of 21PSTEM, Education Providers, our
            users or third parties.{<br />} e. Sharing of Student Work. In some
            instances, Student Data, including, for example, student&#39;s
            response to a prompt, (collectively, &quot;Student Work&quot;) may
            be visible to other students in the same classroom. A teacher or
            school administration official will be able to monitor any such
            Student Work and will be able to hide it at their discretion, for
            example if said Student Work is in violation of a school&#39;s
            policies or the teacher&#39;s desired classroom culture.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>4. Your Choices</h3>
          <p className={classes.Description}>
            You may decline to submit Personally Identifiable Information
            through the 21PSTEM Services, in which case 21PSTEM or your School
            may not be able to provide certain 21PSTEM Services to you. You may
            update or correct your name, email address, or password at any time
            by visiting your “Account Settings” link. You may also delete your
            account altogether there. With respect to User Information provided
            by your School, please reach out to your School to request removal
            or updates of such information. If you have any questions about
            reviewing, modifying, or deleting your information, or if you want
            to remove your name or comments from our website or publicly
            displayed content, you can contact us directly at
            support@21pstem.org. We may not be able to modify or delete your
            information in all circumstances.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>5. Data Security</h3>
          <p className={classes.Description}>
            We care about the security of your information and employ physical,
            administrative, and technological safeguards designed to preserve
            the integrity and security of all information collected through our
            Service. Access to information is limited (through user/password
            credentials or room access code and, in some cases, two factor
            authentication) to those employees who require it to perform their
            job functions. We use industry standard SSL (secure socket layer
            technology) encryption to transfer personal information. Other
            security safeguards include but are not limited to data encryption,
            firewalls, physical access controls to buildings and files, and
            employee training. You can help protect against unauthorized access
            to your account and personal information by selecting and protecting
            your password appropriately and limiting access to your computer and
            browser by signing off after you have finished accessing your
            account.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>6. Children’s Privacy</h3>
          <p className={classes.Description}>
            Our Service is not directed to children under 13, unless and until a
            School has provided consent and authorization for a student under 13
            to use the Service and for 21PSTEM to collect information from such
            student. If you believe that we have inadvertently collected
            Personal Data from a child under 13 years of age without parental
            consent, then please alert us at support@21pstem.org and we will
            promptly delete the child&#39;s Personal Data from our systems.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>7. For Our International Users</h3>
          <p className={classes.Description}>
            By using this Service, you consent to the transfer of your personal
            information to the United States and to the processing of your
            personal information in the United States in accordance with this
            Privacy Policy. You understand that your personal information will
            be subject to the laws of the United States, which may be different
            from those of your country of residence.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>8. Contact Us</h3>
          <p className={classes.Description}>
            Please feel free to contact us with any questions or comments about
            this Privacy Policy, your personal information, your consent, or
            your opt-in or opt-out choices as follows: {<br />} 21PSTEM 375 East
            Elm,
            {<br />} Suite 215 Conshohocken, PA 19428 {<br />} Email:{' '}
            <a href="mailto:support@21pstem.org">support@21pstem.org</a>{' '}
            {<br />} Phone: 610-825-5644
          </p>
        </div>
        <div className={classes.Content}>
          <h3>9. Changes and Updates</h3>
          <p className={classes.Description}>
            a. Updates. This Privacy Policy may be revised periodically and this
            will be reflected in the “date last modified” set forth below. Your
            continued use of the 21PSTEM Services following such update
            constitutes your agreement to the revised Privacy Policy.
            {<br />} b. Last Modified. This Privacy Policy was last modified
            September 22, 2021
          </p>
        </div>
        <hr />
        <Link to="/terms#top" className={classes.Links}>
          Back to Top
        </Link>
        <br />
      </div>
    </Aux>
  );
};

export default Terms;
